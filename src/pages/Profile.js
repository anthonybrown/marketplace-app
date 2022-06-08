import { useState } from "react"
import {
  // AuthCredential,
  getAuth,
  updateProfile,
  updateEmail,
} from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase.config"
import { updateDoc, doc } from "firebase/firestore"
import { toast } from "react-toastify"

function Profile() {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

  const onLogOut = e => {
    auth.signOut()
    navigate("/")
  }

  const handleSubmit = async () => {
    try {
      auth.currentUser.displayName !== name &&
        // update display name in Firebase
        (await updateProfile(auth.currentUser, {
          displayName: name,
        }))

      auth.currentUser.email !== email &&
        (await updateEmail(auth.currentUser, email))

      // update in firestore
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
          <p className='profileDetailsText'>Personal details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && handleSubmit()
              setChangeDetails(prevState => !prevState)
            }}
          >
            {changeDetails ? "Done" : "Change"}
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
      </main>
    </div>
  )
}

export default Profile
