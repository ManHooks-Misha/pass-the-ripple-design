import purpleBox from "@/assets/ripple2/purple box.png";
import yellowBox from "@/assets/ripple2/yellow box.png";
import redBox from "@/assets/ripple2/red box.png";
import blueBox from "@/assets/ripple2/blue box.png";

const WhyLumaSection = () => {
  const cards = [
    {
      title: "WHY LUMA?",
      description: "Luma bridges the storybook world with real life. This digital extension of \"You Matter, Luma\" helps kids feel that they matter while showing them how their everyday actions can brighten someone's world one ripple at a time",
      boxImage: purpleBox
    },
    {
      title: "WHY KINDNESS?",
      description: "Passing the Ripple empowers kids to recognize their own influence. By taking simple actions and seeing their impact, children build confidence, empathy, and the belief that they can create positive change",
      boxImage: yellowBox
    },
    {
      title: "WHY PARTICIPATE?",
      description: "Every child deserves to feel seen and meaningful. Doing this helps them understand their own power to uplift others and create positive change in their world",
      boxImage: redBox
    },
    {
      title: "WHY IT MATTERS?",
      description: "The neuroscience is clear: Building a habit of kindness wires a child's brain for lifelong resilience and well-being.",
      boxImage: blueBox
    }
  ];

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="row box-luma pb-[50px]">
          <div className="grid md:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <div key={index} className="box-back text-center">
                <h4 className="font-teachers font-bold text-[23px] leading-[41px] mb-4 text-center">
                  {card.title}
                </h4>
                <div className="box-back-txt relative flex justify-center items-center">
                  <img src={card.boxImage} alt={card.title} className="w-full" />
                  <p className="absolute w-[85%] font-teachers font-normal text-[20px] leading-[26px] text-center text-black">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLumaSection;
