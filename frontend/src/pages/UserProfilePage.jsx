import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'

const UserProfilePage = () => {
    const {id} = useParams()
    const [user,setUser] = useState()
    const [bookings,setBookings] = useState()

    useEffect(() => {
        (async () => {
            const response = await axios.get(`http://localhost:3000/api/user/${id}`);
            console.log(response)
            setBookings(response.data.bookings)
            setUser(response.data.user)
        })()
    },[id])
  return (
    <div className='m-96'>
      <div>Hello {user?.fullName}</div>
    <div>{user?.fullName} has {bookings?.length ? bookings?.length : 0} bookings</div>
    <div>{user?.fullName.split(" ")[0]} has {bookings?.reduce((sum,booking) => sum + booking.quantity,0)} tickets</div>
    </div>
    
  )
}

export default UserProfilePage