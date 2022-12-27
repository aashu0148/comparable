import React from "react";

import { PageLayout } from "layout/PageLayout";
import HotelsPage from "modules/HotelsPage/HotelsPage";

export default function Hotel() {
  return (
    <PageLayout title="Comparable - Hotel comparison">
      <HotelsPage />
    </PageLayout>
  );
}
