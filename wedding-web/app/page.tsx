'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import ApiBanner from '@/components/home/ApiBanner';
import Stats from '@/components/home/Stats';
import FeaturedTemplates from '@/components/home/FeaturedTemplates';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import PromoBanner from '@/components/home/PromoBanner';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <ApiBanner position="home_top" />
        <Stats />
        <FeaturedTemplates />
        <HowItWorks />
        <ApiBanner position="home_middle" />
        <Testimonials />
        <PromoBanner />
      </main>
      <Footer />
    </>
  );
}
