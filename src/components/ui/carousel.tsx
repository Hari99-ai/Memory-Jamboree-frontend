import * as React from "react"
import Slider from "react-slick"
import { cn } from "../../lib/utils"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

export interface CarouselProps {
  children: React.ReactNode
}

export function Carousel({ children }: CarouselProps) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }
  return (
    <div className={cn("my-4")}>
      <Slider {...settings}>{children}</Slider>
    </div>
  )
}
