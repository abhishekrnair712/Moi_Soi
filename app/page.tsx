"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 transform ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  // Cart State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Accordion State (first item open by default)
  const [activeAccordion, setActiveAccordion] = useState<string | null>("acc1");

  // Scroll Animation State
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  // Add Item to Cart
  const addToCart = () => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === "lychee-boba");
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === "lychee-boba"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: "lychee-boba",
            name: "Moi Soi Popping Boba — Lychee",
            price: 79,
            quantity: 1,
            image: "/lychee-can.png",
          },
        ];
      }
    });
    setCartOpen(true);
  };

  // Update Cart Quantity
  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // Toggle Accordion
  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  // Preload animation frames with keyframe-first scheduling & batching
  useEffect(() => {
    let active = true;
    const totalFrames = 300;
    const loadedImages: HTMLImageElement[] = [];

    const loadFrame = (index: number): Promise<boolean> => {
      return new Promise((resolve) => {
        if (loadedImages[index]) {
          resolve(true);
          return;
        }
        const img = new window.Image();
        img.src = `/images/animation/ezgif-frame-${String(index).padStart(3, "0")}.png`;
        img.onload = () => {
          loadedImages[index] = img;
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
      });
    };

    const preloadAll = async () => {
      // 1. Load the first frame immediately to display something as fast as possible
      await loadFrame(1);
      if (active) {
        setImagesLoaded(true);
      }

      // 2. Load keyframes (every 5th frame) to build a rough path quickly
      const keyframePromises: Promise<boolean>[] = [];
      for (let i = 1; i <= totalFrames; i += 5) {
        keyframePromises.push(loadFrame(i));
      }
      await Promise.all(keyframePromises);

      // 3. Load remaining frames in batches of 10 to avoid request flooding
      const remainingFrames = [];
      for (let i = 1; i <= totalFrames; i++) {
        if (!loadedImages[i]) {
          remainingFrames.push(i);
        }
      }

      const batchSize = 10;
      for (let i = 0; i < remainingFrames.length; i += batchSize) {
        if (!active) break;
        const batch = remainingFrames.slice(i, i + batchSize);
        await Promise.all(batch.map((index) => loadFrame(index)));
      }
    };

    preloadAll();
    imagesRef.current = loadedImages;

    return () => {
      active = false;
    };
  }, []);

  // Track scroll position inside a ref and only update feature index state on transition boundaries
  useEffect(() => {
    const handleScroll = () => {
      // Calculate overall page scroll progress for background canvas
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = docHeight - windowHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      scrollProgressRef.current = progress;

      if (!containerRef.current) return;
      // Calculate progress specifically inside the hero container for text panel active index transitions
      const heroHeight = containerRef.current.scrollHeight;
      const offsetTop = containerRef.current.offsetTop;
      const maxHeroScroll = heroHeight - windowHeight;
      const currentHeroScroll = scrollY - offsetTop;
      const heroProgress = maxHeroScroll > 0 ? Math.min(1, Math.max(0, currentHeroScroll / maxHeroScroll)) : 0;

      // Map scroll progress to the active feature text block
      let newFeatureIndex = 0;
      if (heroProgress < 0.2) newFeatureIndex = 0;
      else if (heroProgress < 0.45) newFeatureIndex = 1;
      else if (heroProgress < 0.7) newFeatureIndex = 2;
      else if (heroProgress < 0.9) newFeatureIndex = 3;
      else newFeatureIndex = 4;

      setActiveFeatureIndex((prev) => {
        if (prev !== newFeatureIndex) {
          return newFeatureIndex;
        }
        return prev;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Butter-smooth canvas drawing loop running via requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const drawFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(drawFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId = requestAnimationFrame(drawFrame);
        return;
      }

      const progress = scrollProgressRef.current;
      const totalFrames = 300;
      const targetIndex = Math.min(
        totalFrames,
        Math.max(1, Math.floor(progress * (totalFrames - 1)) + 1)
      );

      const images = imagesRef.current;
      let imgToDraw = images[targetIndex];

      // Fallback: search for nearest loaded frame to eliminate flicker
      if (!imgToDraw) {
        let left = targetIndex - 1;
        let right = targetIndex + 1;
        while (left >= 1 || right <= totalFrames) {
          if (left >= 1 && images[left]) {
            imgToDraw = images[left];
            break;
          }
          if (right <= totalFrames && images[right]) {
            imgToDraw = images[right];
            break;
          }
          left--;
          right++;
        }
      }

      if (imgToDraw) {
        // Adjust canvas dimensions dynamically to match display style
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
        }

        const imgWidth = imgToDraw.naturalWidth || imgToDraw.width;
        const imgHeight = imgToDraw.naturalHeight || imgToDraw.height;

        if (imgWidth && imgHeight) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const imgRatio = imgWidth / imgHeight;
          const canvasRatio = canvas.width / canvas.height;

          let drawWidth, drawHeight, offsetX, offsetY;

          // Object-fit: cover logic
          if (imgRatio > canvasRatio) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          } else {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(imgToDraw, offsetX, offsetY, drawWidth, drawHeight);
        }
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Map scroll progress to 5 key features
  const features = [
    {
      title: "Moi Soi Popping Boba",
      tagline: "Lychee Refreshment",
      desc: "Bursting with flavor and fun! Our signature Lychee drink features juicy popping boba pearls that explode with refreshment in every sip.",
      showCta: true,
    },
    {
      title: "Naturally Sweetened",
      tagline: "Real Fruit Extracts",
      desc: "Crafted with real lychee extracts to deliver an authentic, light, and tropical sweetness directly from nature.",
      showCta: false,
    },
    {
      title: "Popping Boba Pearls",
      tagline: "Explosive Texture",
      desc: "Juicy, translucent popping boba bubbles that burst with refreshment the second you bite into them.",
      showCta: false,
    },
    {
      title: "Caffeine-Free Energy",
      tagline: "Pure All-Day Hydration",
      desc: "Perfect for everyone, any time of the day or night. Indulge in fun hydration without the jitters.",
      showCta: false,
    },
    {
      title: "Ready to Refresh?",
      tagline: "Instant Boba Love",
      desc: "Get your 330ml bottle of chilled Moi Soi Lychee Boba now and experience the taste explosion!",
      showCta: true,
    },
  ];

  // activeFeatureIndex is now handled in state

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-transparent text-on-surface font-body-md antialiased min-h-screen flex flex-col relative z-0">
      
      {/* Floating Boba Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
      </div>

      {/* Fixed Background Boba Animation Canvas */}
      <div className="fixed inset-0 select-none pointer-events-none -z-20 w-full h-full">
        {!imagesLoaded && (
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 bg-white/50 backdrop-blur-md z-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-secondary font-bold tracking-widest uppercase">Chilling boba...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full transition-opacity duration-300"
          style={{ opacity: imagesLoaded ? 1 : 0.4 }}
        />
      </div>

      {/* TopNavBar */}
      <nav className="sticky top-0 w-full z-45 bg-transparent border-b border-transparent transition-all duration-300">
        <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-3">
            <Image
              alt="Moi Soi Logo"
              className="h-10 w-auto hover:rotate-6 transition-transform duration-300"
              src="/logo.png"
              width={160}
              height={40}
              style={{ width: "auto" }}
            />
            <span className="font-display-lg text-display-lg-mobile md:text-2xl font-extrabold text-primary select-none tracking-tight">
              Moi Soi
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-primary font-bold border-b-2 border-primary font-body-md text-body-md py-1 transition-all"
              href="#"
            >
              Shop
            </a>
            <a
              className="text-secondary hover:text-primary transition-all duration-200 hover:scale-105 font-body-md text-body-md"
              href="#"
            >
              Our Story
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 bg-secondary-container hover:bg-secondary-container/80 text-primary rounded-full transition-all active-bounce cursor-pointer group"
              aria-label="Open Shopping Cart"
            >
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:scale-110">
                shopping_bag
              </span>
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Scroll-based Boba Animation in Background */}
      <section ref={containerRef} className="relative h-[300vh] bg-transparent z-10">
        {/* Ambient background glows inside the scroll block */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-fixed opacity-25 rounded-full blur-[120px] -z-10"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-fixed opacity-15 rounded-full blur-[100px] -z-10"></div>

          {/* Container to align foreground overlay content with site grid layout */}
          <div className="w-full h-full max-w-container-max mx-auto px-gutter flex items-center justify-center md:justify-start pt-20">
            <div className="relative w-full max-w-xl h-[320px] md:h-[420px] flex items-center px-4 md:px-0 z-10">
              {features.map((feature, idx) => {
                const isActive = idx === activeFeatureIndex;
                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 flex flex-col items-start justify-center gap-4 md:gap-6 transition-all duration-700 transform p-4 md:p-6 ${
                      isActive
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                    }`}
                  >
                    {idx === 0 && (
                      <div className="inline-flex items-center gap-2 bg-white/95 px-3.5 py-1.5 rounded-full boba-shadow border border-white/50">
                        <div className="flex text-primary">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0.5, 'wght' 400" }}>star_half</span>
                        </div>
                        <span className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          4.3 Rating
                        </span>
                      </div>
                    )}

                    {idx > 0 && idx < 4 && (
                      <span className="bg-primary-container/10 text-primary font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
                        Feature {idx}
                      </span>
                    )}

                    <h1 className={`font-display-lg text-2xl md:text-4xl font-extrabold text-on-surface leading-tight tracking-tight transition-all duration-500 delay-100 transform ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                      {feature.title} — <span className="text-primary bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">{feature.tagline}</span>
                    </h1>

                    <p className={`font-body-lg text-xs md:text-sm text-secondary leading-relaxed max-w-md transition-all duration-500 delay-200 transform ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                      {feature.desc}
                    </p>

                    {feature.showCta && (
                      <div className="flex flex-col gap-3 w-full sm:w-auto mt-2">
                        {idx === 0 && (
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl md:text-3xl font-extrabold text-primary">₹79</span>
                            <span className="text-sm md:text-base text-secondary line-through">MRP ₹150</span>
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ₹71 OFF
                            </span>
                          </div>
                        )}
                        <button
                          onClick={addToCart}
                          className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-full font-bold text-xs md:text-sm bounce-hover active-bounce boba-shadow flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
                        >
                          <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/20 backdrop-blur-md border-y border-outline-variant/20 z-10 relative">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {/* Feature 1 */}
            <ScrollReveal delay={0}>
              <div className="flex flex-col items-center text-center gap-4 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(184,0,73,0.06)] hover:border-primary/20 transition-all duration-500 ease-out">
                <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Naturally Flavored Lychee</h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">Real fruit extracts for an authentic tropical taste.</p>
              </div>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal delay={100}>
              <div className="flex flex-col items-center text-center gap-4 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(184,0,73,0.06)] hover:border-primary/20 transition-all duration-500 ease-out">
                <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-tertiary text-4xl">bubble_chart</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Fun Popping Boba</h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">Exciting texture that bursts with juice in your mouth.</p>
              </div>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal delay={200}>
              <div className="flex flex-col items-center text-center gap-4 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(184,0,73,0.06)] hover:border-primary/20 transition-all duration-500 ease-out">
                <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-4xl">energy_savings_leaf</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Caffeine-Free</h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">Perfect for all-day enjoyment without the jitters.</p>
              </div>
            </ScrollReveal>

            {/* Feature 4 */}
            <ScrollReveal delay={300}>
              <div className="flex flex-col items-center text-center gap-4 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(184,0,73,0.06)] hover:border-primary/20 transition-all duration-500 ease-out">
                <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-tertiary text-4xl">ac_unit</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Best Served Chilled</h3>
                <p className="font-body-md text-sm text-secondary leading-relaxed">Tastes best when icy cold. Refreshment guaranteed.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Specifications Accordion */}
      <section className="py-24 bg-surface-container-low/20 backdrop-blur-md z-10 relative">
        <div className="max-w-3xl mx-auto px-gutter w-full">
          <ScrollReveal>
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-center mb-12 text-on-surface">
              Product Details
            </h2>
          </ScrollReveal>
          <div className="space-y-4">
            {/* Accordion Item 1 */}
            <ScrollReveal delay={0}>
              <div className="border border-outline-variant/40 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                <button
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  onClick={() => toggleAccordion("acc1")}
                >
                  <span className="font-headline-md text-lg font-bold flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary">straighten</span>
                    Net Qty
                  </span>
                  <span
                    className="material-symbols-outlined transition-transform duration-300 text-secondary"
                    style={{
                      transform: activeAccordion === "acc1" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeAccordion === "acc1" ? "max-h-40 border-t border-outline-variant/25" : "max-h-0"
                  }`}
                >
                  <div className="p-6 text-secondary font-body-lg text-base leading-relaxed bg-background/30">
                    330ml of pure refreshment in every bottle.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Accordion Item 2 */}
            <ScrollReveal delay={100}>
              <div className="border border-outline-variant/40 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                <button
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  onClick={() => toggleAccordion("acc2")}
                >
                  <span className="font-headline-md text-lg font-bold flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary">public</span>
                    Country of Origin
                  </span>
                  <span
                    className="material-symbols-outlined transition-transform duration-300 text-secondary"
                    style={{
                      transform: activeAccordion === "acc2" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeAccordion === "acc2" ? "max-h-40 border-t border-outline-variant/25" : "max-h-0"
                  }`}
                >
                  <div className="p-6 text-secondary font-body-lg text-base leading-relaxed bg-background/30">
                    Proudly sourced and crafted in Vietnam.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Accordion Item 3 */}
            <ScrollReveal delay={200}>
              <div className="border border-outline-variant/40 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                <button
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  onClick={() => toggleAccordion("acc3")}
                >
                  <span className="font-headline-md text-lg font-bold flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Shelf Life
                  </span>
                  <span
                    className="material-symbols-outlined transition-transform duration-300 text-secondary"
                    style={{
                      transform: activeAccordion === "acc3" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeAccordion === "acc3" ? "max-h-40 border-t border-outline-variant/25" : "max-h-0"
                  }`}
                >
                  <div className="p-6 text-secondary font-body-lg text-base leading-relaxed bg-background/30">
                    Stays fresh for 24 months from the date of manufacture.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Accordion Item 4 */}
            <ScrollReveal delay={300}>
              <div className="border border-outline-variant/40 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                <button
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  onClick={() => toggleAccordion("acc4")}
                >
                  <span className="font-headline-md text-lg font-bold flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary">eco</span>
                    Food Type
                  </span>
                  <span
                    className="material-symbols-outlined transition-transform duration-300 text-secondary"
                    style={{
                      transform: activeAccordion === "acc4" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeAccordion === "acc4" ? "max-h-40 border-t border-outline-variant/25" : "max-h-0"
                  }`}
                >
                  <div className="p-6 text-secondary font-body-lg text-base leading-relaxed bg-background/30">
                    100% Vegetarian product.
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low/50 backdrop-blur-md mt-auto border-t border-outline-variant/30 z-10 relative">
        <ScrollReveal>
          <div className="w-full py-16 px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  alt="Moi Soi Logo"
                  className="h-8 w-auto"
                  src="/logo.png"
                  width={120}
                  height={30}
                  style={{ width: "auto" }}
                />
                <span className="font-headline-md text-xl font-bold text-primary select-none">
                  Moi Soi
                </span>
              </div>
              <p className="text-secondary font-body-md text-sm leading-relaxed mb-6">
                Redefining hydration with fun textures and tropical flavors. Join the boba revolution.
              </p>
              <div className="flex gap-4">
                <button
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all bounce-hover cursor-pointer border border-outline-variant/20 shadow-sm"
                  aria-label="Share"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all bounce-hover cursor-pointer border border-outline-variant/20 shadow-sm"
                  aria-label="Like"
                >
                  <span className="material-symbols-outlined text-lg">thumb_up</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-on-surface text-base mb-1">Company</h4>
                <a className="text-secondary hover:text-primary transition-colors text-sm" href="#">Privacy Policy</a>
                <a className="text-secondary hover:text-primary transition-colors text-sm" href="#">Terms of Service</a>
                <a className="text-secondary hover:text-primary transition-colors text-sm" href="#">Shipping Info</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-on-surface text-base mb-1">Contact</h4>
                <a className="text-secondary hover:text-primary transition-colors text-sm underline break-all" href="mailto:help@moisoi.com">
                  help@moisoi.com
                </a>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-outline-variant/40 py-8 px-gutter text-center">
            <p className="text-secondary font-body-md text-xs">
              © 2024 Moi Soi. All rights reserved. Drogheria Sellers Pvt Ltd.
            </p>
          </div>
        </ScrollReveal>
      </footer>

      {/* Cart Drawer Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-white/90 dark:bg-surface/90 backdrop-blur-2xl shadow-2xl border-l border-outline-variant/40 flex flex-col z-50 transition-transform duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
              <h2 className="font-display-lg text-xl font-extrabold text-on-surface flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
                Your Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container transition-colors text-secondary cursor-pointer"
                aria-label="Close Cart"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable Items Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center gap-4 py-12">
                  <span className="material-symbols-outlined text-6xl text-secondary/30 select-none">
                    shopping_cart
                  </span>
                  <div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">Your cart is empty</h3>
                    <p className="text-secondary text-sm mt-1 max-w-xs">
                      Add some popping boba deliciousness to start your refreshment!
                    </p>
                  </div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white/50 border border-outline-variant/20 rounded-2xl boba-shadow"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-background/80 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image
                        alt={item.name}
                        className="object-contain p-1"
                        src={item.image}
                        fill
                        sizes="80px"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-on-surface text-sm line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-secondary mt-0.5">330ml Bottle</p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Price */}
                        <span className="text-primary font-extrabold">
                          ₹{item.price * item.quantity}
                        </span>

                        {/* Quantity picker */}
                        <div className="flex items-center gap-2 bg-secondary-container/60 px-3 py-1.5 rounded-full border border-primary/5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-primary hover:scale-110 active:scale-95 transition-all w-5 h-5 flex items-center justify-center font-bold text-lg select-none cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="font-bold text-xs w-4 text-center select-none text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-primary hover:scale-110 active:scale-95 transition-all w-5 h-5 flex items-center justify-center font-bold text-lg select-none cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low/40 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-secondary">Subtotal</span>
                  <span className="text-2xl font-extrabold text-primary">₹{totalPrice}</span>
                </div>
                <p className="text-xs text-secondary">
                  Shipping and taxes calculated at checkout. Delivery is free for new customers.
                </p>
                <button
                  onClick={() => alert("Thank you for your order! Checkout process simulation.")}
                  className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-full font-bold text-base bounce-hover active-bounce boba-shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">credit_card</span>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
