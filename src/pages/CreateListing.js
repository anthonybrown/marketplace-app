import { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase.config"
import { useNavigate } from "react-router-dom"
import Spinner from "../components/Spinner"
import { toast } from "react-toastify"
import { v4 as uuidv4 } from "uuid"

function CreateListing() {
  const [geoLocationEnabled, setGeoLocationEnabled] =
    useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  const handleSubmit = async e => {
    e.preventDefault()

    if (discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error(
        "Discounted price should be lower than regular price.",
      )
      return
    }

    if (images.length > 6) {
      setLoading(false)
      toast.error("Maximum of 6 images")
      return
    }

    let geolocation = {}
    let location

    if (geoLocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`,
      )

      const data = await response.json()
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0
      location =
        data.status === "ZERO_RESULTS"
          ? undefined
          : data.results[0]?.formatted_address

      if (
        location === undefined ||
        location.includes("undefined")
      ) {
        setLoading(false)
        toast.error("Please enter a correct address.")
        return
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
    }

    const storeImage = async image => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${
          image.name
        }-${uuidv4()}`

        const storageRef = ref(storage, "images/" + fileName)

        const metadata = {
          contentType: "image/jpg",
        }
        const uploadTask = uploadBytesResumable(
          storageRef,
          image,
          metadata,
        )

        uploadTask.on(
          "state_changed",
          snapshot => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) *
              100
            console.log("Upload is " + progress + "% done")
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused")
                break
              case "running":
                console.log("Upload is running")
                break
            }
          },
          error => {
            reject(error)
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then(
              downloadURL => {
                // console.log("File available at", downloadURL)
                resolve(downloadURL)
              },
            )
          },
        )
      })
    }

    const imgUrls = await Promise.all(
      [...images].map(image => storeImage(image)),
    ).catch(() => {
      setLoading(false)
      toast.error("Images not uploaded")
      return
    })

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(
      collection(db, "listings"),
      formDataCopy,
    )

    setLoading(false)

    toast.success("Listing was saved!")
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = e => {
    let boolean = null

    if (e.target.value === "true") {
      boolean = true
    }
    if (e.target.value === "false") {
      boolean = false
    }

    // files
    if (e.target.files) {
      setFormData(prevState => ({
        ...prevState,
        images: e.target.files,
      }))
    }
    // text/booleans/numbers
    if (!e.target.files) {
      setFormData(prevState => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, user => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate("/sign-in")
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  if (loading) return <Spinner />

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a listing</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label htmlFor='' className='formLabel'>
            Sell / Rent
          </label>
          <div className='formButtons'>
            <button
              type='button'
              id='type'
              className={
                type === "sale" ? "formButtonActive" : "formButton"
              }
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>

            <button
              type='button'
              id='type'
              className={
                type === "rent" ? "formButtonActive" : "formButton"
              }
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label htmlFor='name' className='formLabel'>
            Name
          </label>
          <input
            id='name'
            className='formInputName'
            type='text'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='flexRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                type='number'
                id='bedrooms'
                className='formInputSmall'
                value={bedrooms}
                onChange={onMutate}
                max='50'
                min='1'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                max='50'
                min='1'
                required
              />
            </div>
          </div>
          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={
                parking ? "formButtonActive" : "formButton"
              }
              id='parking'
              type='button'
              value={true}
              onClick={onMutate}
              max='50'
              min='1'
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null
                  ? "formButtonActive"
                  : "formButton"
              }
            >
              No
            </button>
          </div>
          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={
                furnished ? "formButtonActive" : "formButton"
              }
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              id='furnished'
              type='button'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor='address' className='formLabel'>
            Address
          </label>
          <textarea
            name='address'
            id='address'
            value={address}
            onChange={onMutate}
            required
            cols='30'
            rows='5'
          />
          {!geoLocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  type='number'
                  className='formInputSmall'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  type='number'
                  className='formInputSmall'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? "formButtonActive" : "formButton"}
              id='offer'
              type='button'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price:</label>
          <div className='formPriceDiv'>
            <input
              type='number'
              id='regularPrice'
              className='formInputSmall'
              value={regularPrice}
              onChange={onMutate}
              max='750000000'
              min='50'
              required
            />
            {type === "rent" && (
              <p className='formPriceText'>$ / Month</p>
            )}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                type='number'
                id='discountedPrice'
                className='formInputSmall'
                value={discountedPrice}
                onChange={onMutate}
                max='750000000'
                min='50'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            type='file'
            className='formInputFile'
            id='images'
            onChange={onMutate}
            max={6}
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />

          <button
            className='primaryButton createListingButton'
            type='submit'
          >
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
