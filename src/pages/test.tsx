import Phaser from "phaser";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

const DynamicComponentWithNoSSR = dynamic(() => import('@/components/test'), { ssr: false });

const Home = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
  }, []);

  return (
    <div>
      <div key={Math.random()} id="game"></div>
      {loading ? <DynamicComponentWithNoSSR /> : null}
    </div>
  );
};

export default Home;