declare module 'react-simple-maps' {
  import { ComponentType, SVGProps, MouseEvent } from 'react'
  
  export interface ComposableMapProps {
    projection?: string
    className?: string
    style?: React.CSSProperties
    width?: number
    height?: number
    children?: React.ReactNode
  }
  export const ComposableMap: ComponentType<ComposableMapProps>

  export interface GeographiesProps {
    geography: string | object
    children: (data: { geographies: any[] }) => React.ReactNode
  }
  export const Geographies: ComponentType<GeographiesProps>

  export interface GeographyProps {
    geography: any
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: { default?: object; hover?: object; pressed?: object }
    className?: string
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
    onClick?: (event: React.MouseEvent) => void
  }
  export const Geography: ComponentType<GeographyProps>
}
