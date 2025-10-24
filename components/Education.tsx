import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const educationContent = [
  {
    title: "Understanding Waste Segregation",
    content: "Segregating waste means separating it into different types. The three main categories are Wet Waste (kitchen scraps, food), Dry Waste (paper, plastic, glass), and Hazardous Waste (batteries, paint, bulbs). Proper segregation is the first step to effective recycling and composting.",
    image: "https://plus.unsplash.com/premium_photo-1661775001559-693657aa1f81?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "How to Compost at Home",
    content: "Composting is a natural process of recycling organic matter, such as leaves and food scraps, into a valuable fertilizer. You can start with a simple bin. Layer your wet waste (greens) with dry waste (browns) like dried leaves or cardboard. Keep it moist and turn it occasionally.",
    image: "https://images.unsplash.com/photo-1604245634825-5a7a7837718f?q=80&w=2072&auto=format&fit=crop"
  },
  {
    title: "The 3 R's: Reduce, Reuse, Recycle",
    content: "Reduce the amount of waste you produce. Reuse items multiple times before throwing them away. Recycle materials like paper, plastic, and metal to turn them into new products. This simple mantra helps conserve resources and protect the environment.",
    image: "https://images.unsplash.com/photo-1591129406434-13b3d5828889?q=80&w=2070&auto=format&fit=crop"
  }
];

const EducationComponent: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark mb-4">Waste Management 101</h2>
            <p className="text-text-light dark:text-text-dark mb-6">Learn how your small actions can make a big impact. Here are some tips to get you started.</p>
            
            <div className="space-y-3">
                {educationContent.map((item, index) => (
                    <div 
                        key={index} 
                        className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden border border-border-light dark:border-border-dark animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <button 
                            onClick={() => toggleAccordion(index)}
                            className={`w-full flex justify-between items-center p-4 text-left font-semibold text-lg transition-colors duration-300 ${openIndex === index ? 'text-primary bg-primary/5 dark:bg-primary/10' : 'text-heading-light dark:text-heading-dark'}`}
                        >
                            <span>{item.title}</span>
                            <ChevronDown className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                            <div className="px-4 pb-4">
                                <img src={item.image} alt={item.title} className="rounded-md mb-3 w-full object-cover h-32"/>
                                <p className="text-text-light dark:text-text-dark">{item.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationComponent;