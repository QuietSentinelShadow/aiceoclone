import React from "react";
import { Composition } from "remotion";
import { FiveYearOld } from "./videos/FiveYearOld";
import { Professional } from "./videos/Professional";
import { Influencer } from "./videos/Influencer";
import { CeoConceptual } from "./videos/CeoConceptual";
import { CeoNullclawAdvanced } from "./videos/CeoNullclawAdvanced";
import { CeoClawEmpire } from "./videos/CeoClawEmpire";
import { WIDTH, HEIGHT, FPS } from "./lib/constants";
import audioDurations from "./audio-durations.json";

const totals = audioDurations.videoTotals;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FiveYearOld"
        component={FiveYearOld}
        durationInFrames={totals["five-year-old"]}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Professional"
        component={Professional}
        durationInFrames={totals["professional"]}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Influencer"
        component={Influencer}
        durationInFrames={totals["influencer"]}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CeoConceptual"
        component={CeoConceptual}
        durationInFrames={totals["ceo-conceptual"]}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CeoNullclawAdvanced"
        component={CeoNullclawAdvanced}
        durationInFrames={totals["ceo-nullclaw-advanced"]}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CeoClawEmpire"
        component={CeoClawEmpire}
        durationInFrames={totals["ceo-claw-empire"]}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
