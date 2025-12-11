import { HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', padding = 'md', hover = false, children, className = '', ...props }, ref) => {
        const baseStyles = 'bg-white rounded-xl transition-all duration-200'

        const variantStyles = {
            default: 'border border-gray-100',
            bordered: 'border-2 border-gray-200',
            elevated: 'shadow-md hover:shadow-lg'
        }

        const paddingStyles = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8'
        }

        const hoverStyles = hover ? 'hover:shadow-lg hover:border-indigo-200 cursor-pointer hover:scale-[1.01]' : ''

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export default Card
