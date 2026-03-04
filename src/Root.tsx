import React from "react";
import { Composition } from "remotion";
import { FiveYearOld } from "./videos/FiveYearOld";
import { Professional } from "./videos/Professional";
import { Influencer } from "./videos/Influencer";
import { CeoConceptual } from "./videos/CeoConceptual";
import { CeoNullclawAdvanced } from "./videos/CeoNullclawAdvanced";
import { CeoClawEmpire } from "./videos/CeoClawEmpire";
import { WIDTH, HEIGHT, FPS } from "./lib/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FiveYearOld"
        component={FiveYearOld}
        durationInFrames={8 * 5 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Professional"
        component={Professional}
        durationInFrames={10 * 8 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Influencer"
        component={Influencer}
        durationInFrames={7 * 5 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CeoConceptual"
        component={CeoConceptual}
        durationInFrames={6 * 8 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CeoNullclawAdvanced"
        component={CeoNullclawAdvanced}
        durationInFrames={10 * 7 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CeoClawEmpire"
        component={CeoClawEmpire}
        durationInFrames={10 * 7 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
