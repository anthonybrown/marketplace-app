import { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Spinner from "../components/Spinner"

function CreatListing() {
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

  const handleSubmit = e => {
    e.preventDefault()
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

export default CreatListing
