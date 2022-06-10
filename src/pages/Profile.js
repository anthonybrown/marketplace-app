import { useState, useEffect } from "react"
import { getAuth, updateProfile, updateEmail } from "firebase/auth"
import { useNavigate, Link } from "react-router-dom"
import { db } from "../firebase.config"
import {
  updateDoc,
  doc,
  collection,
  query,
  where,
  orderBy,
  deleteDoc,
  getDocs,
} from "firebase/firestore"
import { toast } from "react-toastify"
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg"
import homeIcon from "../assets/svg/homeIcon.svg"
import { list } from "firebase/storage"
import ListingItem from "../components/ListingItem"

function Profile() {
  const auth = getAuth()

  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, "listings")

      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc"),
      )

      const querySnap = await getDocs(q)

      const listings = []

      querySnap.forEach(doc => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })

      setListings(listings)
      setLoading(false)
    }

    fetchUserListings()
  }, [auth.currentUser.uid])

  const onLogOut = e => {
    auth.signOut()
    navigate("/")
  }

  const handleSubmit = async () => {
    try {
      auth.currentUser.displayName !== name &&
        (await updateProfile(auth.currentUser, {
          displayName: name,
        }))

      auth.currentUser.email !== email &&
        (await updateEmail(auth.currentUser, email))

      const userRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(userRef, {
        name,
        email,
      })
      toast.success(
        "You've updated your details successfully 🎉 🍻 🎈",
      )
    } catch (error) {
      toast.error("Couldn't update profile details 💩")
    }
  }

  const handleChange = e =>
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))

  const onDelete = async listingId => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", listingId))
      const updatedListings = listings.filter(
        listing => listing.id !== listingId,
      )
      setListings(updatedListings)
      toast.success("Successfully deleted listing")
    }
  }

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button
          type='button'
          className='logOut'
          onClick={onLogOut}
        >
          Log Out
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && handleSubmit()
              setChangeDetails(prevState => !prevState)
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>
        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={
                !changeDetails
                  ? "profileName"
                  : "profileNameActive"
              }
              disabled={!changeDetails}
              value={name}
              onChange={handleChange}
            />
            <input
              type='email'
              id='email'
              className={
                !changeDetails
                  ? "profileEmail"
                  : "profileEmailActive"
              }
              disabled={!changeDetails}
              value={email}
              onChange={handleChange}
            />
          </form>
        </div>
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'>Your Listings</p>
            <ul className='listingsList'>
              {listings.map(listing => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
