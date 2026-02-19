"use client";

import TemplateShell from "@/components/template-base/TemplateShell";
import { config } from "../config";
import BottomNav from "./BottomNav";
import CoverPage from "./CoverPage";
import LetterPage from "./LetterPage";
import FinalPage from "./FinalPage";
import EditPanel from "./EditPanel";

export default function Shell() {
  return (
    <TemplateShell
      config={config}
      CoverPage={CoverPage}
      LetterPage={LetterPage}
      FinalPage={FinalPage}
      BottomNav={BottomNav}
      EditPanel={EditPanel}
    />
  );
}
