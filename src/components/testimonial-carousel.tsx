import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "~/components/ui/carousel"
import { testimonials } from "~/lib/data"

export function TestimonialCarousel() {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true
      }}
      plugins={[Autoplay({ delay: 2000 })]}
    >
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem class="sm:basis-1/2 lg:basis-1/3">
            <div class="rounded-lg h-full text-card-foreground relative overflow-hidden border border-border p-6 z-0 flex justify-between flex-col">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="absolute top-6 left-6 size-8 text-primary/10"
              >
                <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
                <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
              </svg>
              <div class="pl-2 pt-2 text-muted-foreground italic">"{testimonial.quote}"</div>
              <div class="pt-6">
                <div class="flex items-center gap-3">
                  <img
                    class="size-8 rounded-full"
                    src={testimonial.avatar}
                    alt={testimonial.author}
                  />
                  <div>
                    <p class="font-medium">{testimonial.author}</p>
                    <p class="text-sm text-muted-foreground">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div class="flex justify-center gap-2 mt-6">
        <CarouselPrevious class="relative inset-auto mx-1" />
        <CarouselNext class="relative inset-auto mx-1" />
      </div>
    </Carousel>
  )
}
