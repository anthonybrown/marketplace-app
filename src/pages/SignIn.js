import { useState } from "react"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg"
import visibilityIcon from "../assets/svg/visibilityIcon.svg"

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const { email, password } = formData

  const navigate = useNavigate()

  const handleOnChange = e => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const auth = getAuth()

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )

      if (userCredential.user) navigate("/")
    } catch (error) {
      toast.error("Bad User Credentials", {
        autoClose: 3000,
        position: "top-center",
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
          <form onSubmit={handleSubmit}>
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

            <div className='signInBar'>
              <p className='signInText'>Sign In</p>
              <button className='signInButton'>
                <ArrowRightIcon
                  fill='#ffffff'
                  width={34}
                  height={34}
                />
              </button>
            </div>
          </form>
          {/* Google OAuth component */}

          <Link to='/sign-up' className='registerLink'>
            Sign Up Instead
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignIn
