import React from "react";

const disciplineComponents: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
 
  "5-Minute Numbers": React.lazy(() => import("./diciplines/FiveMinNumbers")),
  "5-Minute Images": React.lazy(() => import("./diciplines/FiveMinImages")),
  "5-Minute Dates": React.lazy(() => import("./diciplines/FiveMinDates")),
  "5-Minute Words": React.lazy(() => import("./diciplines/FiveMinWords")),
  "15-Minute Numbers": React.lazy(() => import("./diciplines/FifteenMinNumbers")),
  "15-Minute Names & Faces": React.lazy(() => import("./diciplines/FifteenMinNamesFaces")),
  "30-Minute Binary": React.lazy(() => import("./diciplines/ThirtyMinBinary")),
};

export default disciplineComponents;
