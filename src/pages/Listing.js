import { useEffect, useState } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet"
import { Navigation, Pagination, Scrollbar, A11y } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css/bundle"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../firebase.config"
import Spinner from "../components/Spinner"
import shareIcon from "../assets/svg/shareIcon.svg"
import { list } from "firebase/storage"

function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sharedLinkCopied, setSharedLinkCopied] = useState(false)

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth()

  useEffect(() => {
    const fetchListings = async () => {
      const docRef = doc(db, "listings", params.listingId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        console.log(docSnap.data())
        setListing(docSnap.data())
        setLoading(false)
      }
    }

    fetchListings()
  }, [navigate, params.listingId])

  if (loading) return <Spinner />

  return (
    <main>
      <div>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          style={{ height: 550 }}
        >
          {listing.imgUrls.map((url, idx) => {
            return (
              <SwiperSlide key={idx}>
                <div
                  className='swiperSlideDiv'
                  style={{
                    background: `url(${listing.imgUrls[idx]}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          setSharedLinkCopied(true)
          setTimeout(() => {
            setSharedLinkCopied(false)
          }, 2000)
        }}
      >
        <img src={shareIcon} alt='' />
      </div>

      {sharedLinkCopied && (
        <p className='linkCopied'>Link Copied!</p>
      )}
      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name} - ${" "}
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>
          For {listing.type === "rent" ? "Rent" : "Sale"}
        </p>

        {listing.offer && (
          <p className='discountPrice'>
            ${listing.regularPrice - listing.discountedPrice}
            discount
          </p>
        )}

        <ul className='listingDetailsList'>
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : `1 Bedroom`}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : `1 Bathroom`}
          </li>
          <li>{listing.parking && "Parking Spot"}</li>
          <li>{listing.furnished && "Furnished"}</li>
          <p className='listingLocationTitle'>Location</p>

          <div className='leafletContainer'>
            <MapContainer
              style={{ height: "100%", width: "100%" }}
              center={[
                listing.geolocation.lat,
                listing.geolocation.lng,
              ]}
              zoom={13}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
              />

              <Marker
                position={[
                  listing.geolocation.lat,
                  listing.geolocation.lng,
                ]}
              >
                <Popup>{listing.location}</Popup>
              </Marker>
            </MapContainer>
          </div>

          {auth.currentUser?.uid !== listing.userRef && (
            <Link
              to={`/contact/${listing.userRef}?listingName=${listing.name}`}
              className='primaryButton'
            >
              Contact Landlord
            </Link>
          )}
        </ul>
      </div>
    </main>
  )
}

export default Listing
