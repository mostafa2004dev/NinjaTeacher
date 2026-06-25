import React from 'react'

export default function validmessage({ field, isTouched }) {
  return (
    <>
      {field && isTouched &&
        < p className='text-red-600'>{field.message}</p>}
    </>
  )
}
