import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { setDoc, doc, serverTimestamp } from "firebase/firestore"
import OAuth from "../components/OAuth"
import { db } from "../firebase.config"
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg"
import visibilityIcon from "../assets/svg/visibilityIcon.svg"

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const { name, email, password } = formData

  const navigate = useNavigate()

  const handleOnChange = e => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const handleOnSubmit = async e => {
    e.preventDefault()

    try {
      const auth = getAuth()

      const userCrendential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )

      const user = userCrendential.user

      updateProfile(auth.currentUser, {
        displayName: name,
      })

      const formDataCopy = { ...formData }
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()

      await setDoc(doc(db, "users", user.uid), formDataCopy)

      navigate("/")
      toast.success("login successful!")
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong with the registration", {
        autoClose: 3000,
      })
    }
  }

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back!</p>
        </header>

        <main>
          <form onSubmit={handleOnSubmit}>
            <input
              className='nameInput'
              type='text'
              name='name'
              id='name'
              placeholder='Name'
              value={name}
              onChange={handleOnChange}
            />
            <input
              className='emailInput'
              type='email'
              name='email'
              id='email'
              placeholder='Email'
              value={email}
              onChange={handleOnChange}
            />
            <div className='passwordInputDiv'>
              <input
                className='passwordInput'
                id='password'
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                value={password}
                onChange={handleOnChange}
              />

              <img
                src={visibilityIcon}
                alt='show password'
                className='showPassword'
                onClick={() =>
                  setShowPassword(prevState => !prevState)
                }
              />
            </div>

            <Link
              to='/forgot-password'
              className='forgotPasswordLink'
            >
              Forgot Password
            </Link>

            <div className='signUpBar'>
              <p className='signUpText'>Sign Up</p>
              <button className='signUpButton'>
                <ArrowRightIcon
                  fill='#ffffff'
                  width={34}
                  height={34}
                />
              </button>
            </div>
          </form>
          <OAuth />
          <Link to='/sign-in' className='registerLink'>
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignUp
