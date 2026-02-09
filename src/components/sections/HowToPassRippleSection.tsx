import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HowToPassRippleSection = () => {
  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="row slider-hme flex justify-center pb-[85px] md:pb-[85px]">
          <h3 className="ripple-heading font-teachers font-bold text-[28px] leading-[41px] mb-[50px] text-center w-full">
            HOW TO PASS THE RIPPLE?
          </h3>
          <div className="w-full md:w-[87%] relative">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <div className="relative w-full">
                    <div className="carousel-caption absolute left-[40%] right-[30px] bottom-[30px] top-[8%]">
                      <h5 className="font-teachers font-medium text-[27px] leading-[41px] text-center text-black mb-5">
                        Get your Ripple Cards!
                      </h5>
                      <div className="slider-bn-p mb-5">
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black mb-0">
                          Have you read the book: You Matter, Luma?
                        </p>
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black mb-0">
                          You can check it out here: <a href="https://youmatterluma.com/" className="text-[#9F00C7]" target="_blank" rel="noopener noreferrer">https://youmatterluma.com/</a>
                        </p>
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black mb-0">
                          This will help you see how kindness can help the world.
                        </p>
                      </div>
                      <div className="slider-bn-p mb-5">
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black">
                          Pass The Ripple is an idea to help people see how much they matter. and because we want to spread the word we created Ripple Cards to help the movement grow!
                        </p>
                      </div>
                      <div className="slider-bn-p">
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black">
                          You can get your free Ripple Card by creating or loggin into an account!
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="relative w-full">
                    <div className="carousel-caption absolute left-[40%] right-[30px] bottom-[30px] top-[8%]">
                      <h5 className="font-teachers font-medium text-[27px] leading-[41px] text-center text-black mb-5">
                        Get your Ripple Cards!
                      </h5>
                      <div className="slider-bn-p mb-5">
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black mb-0">
                          Have you read the book: You Matter, Luma?
                        </p>
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black mb-0">
                          You can check it out here: <a href="https://youmatterluma.com/" className="text-[#9F00C7]" target="_blank" rel="noopener noreferrer">https://youmatterluma.com/</a>
                        </p>
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black mb-0">
                          This will help you see how kindness can help the world.
                        </p>
                      </div>
                      <div className="slider-bn-p mb-5">
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black">
                          Pass The Ripple is an idea to help people see how much they matter. and because we want to spread the word we created Ripple Cards to help the movement grow!
                        </p>
                      </div>
                      <div className="slider-bn-p">
                        <p className="font-teachers font-normal text-[20px] leading-[26px] text-center text-black">
                          You can get your free Ripple Card by creating or loggin into an account!
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-[-125px] opacity-100 hidden md:flex border-0 bg-transparent hover:bg-transparent" />
              <CarouselNext className="right-[-125px] opacity-100 hidden md:flex border-0 bg-transparent hover:bg-transparent" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToPassRippleSection;

