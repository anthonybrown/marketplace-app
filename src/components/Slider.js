import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore"
import { db } from "../firebase.config"
import "swiper/css/bundle"
import Spinner from "./Spinner"
import { Navigation, Pagination, Scrollbar, A11y } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"

function Slider() {
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, "listings")
      const q = query(
        listingsRef,
        orderBy("timestamp", "desc"),
        limit(7),
      )

      const querySnap = await getDocs(q)

      let listings = []

      querySnap.forEach(doc => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })

      setListings(listings)
      setLoading(false)
    }

    fetchListings()
  }, [])

  if (loading) return <Spinner />

  return (
    listings && (
      <>
        <p className='exploreHeading'>Recomended</p>

        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          style={{ height: 550 }}
        >
          {listings.map(({ data, id }) => {
            return (
              <SwiperSlide
                key={id}
                onClick={() =>
                  navigate(`/category/${data.type}/${id}`)
                }
              >
                <div
                  className='swiperSlideDiv'
                  style={{
                    background: `url(${data.imgUrls[0]}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                >
                  <p className='swiperSlideText'>{data.name}</p>
                  <p className='swiperSlidePrice'>
                    ${data.discountedPrice ?? data.regularPrice}{" "}
                    {data.type === "rent" && "/ month"}{" "}
                  </p>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </>
    )
  )
}

export default Slider
