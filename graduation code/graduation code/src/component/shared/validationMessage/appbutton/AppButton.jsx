import { Button } from '@heroui/react'
import React from 'react'

export default function AppButton({ children, isDisabled, isLoading, onSubmit }) {
    return (
        <Button
            color="warning"
            type='submit'
            isLoading={isLoading}
            isDisabled={isDisabled}
            onSubmit={onSubmit}
        >{children}</Button>
    )
}