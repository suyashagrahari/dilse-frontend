import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface TemplateData {
  heading: string;
  body: string;
  senderName: string;
}

interface TemplateEditState {
  savedData: Record<string, TemplateData>;
  editMode: "manual" | "ai" | null;
  currentStep: number;
  aiPrompt: string;
  aiLoading: boolean;
  aiError: string | null;
}

const initialState: TemplateEditState = {
  savedData: {},
  editMode: null,
  currentStep: 0,
  aiPrompt: "",
  aiLoading: false,
  aiError: null,
};

export const generateWithAI = createAsyncThunk(
  "templateEdit/generateWithAI",
  async (
    {
      prompt,
      templateId,
      templateType,
    }: { prompt: string; templateId: string; templateType: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, templateId, templateType }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      return { templateId, data: data as TemplateData };
    } catch {
      return rejectWithValue(
        "AI generation failed. Please try again or use manual mode."
      );
    }
  }
);

const templateEditSlice = createSlice({
  name: "templateEdit",
  initialState,
  reducers: {
    setEditMode(state, action: PayloadAction<"manual" | "ai" | null>) {
      state.editMode = action.payload;
      state.currentStep = action.payload ? 1 : 0;
      state.aiError = null;
    },
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    nextStep(state) {
      state.currentStep += 1;
    },
    prevStep(state) {
      if (state.currentStep > 0) state.currentStep -= 1;
    },
    resetEdit(state) {
      state.editMode = null;
      state.currentStep = 0;
      state.aiPrompt = "";
      state.aiLoading = false;
      state.aiError = null;
    },
    updateTemplateField(
      state,
      action: PayloadAction<{
        templateId: string;
        field: keyof TemplateData;
        value: string;
      }>
    ) {
      const { templateId, field, value } = action.payload;
      if (!state.savedData[templateId]) {
        state.savedData[templateId] = { heading: "", body: "", senderName: "" };
      }
      state.savedData[templateId][field] = value;
    },
    setTemplateData(
      state,
      action: PayloadAction<{ templateId: string; data: TemplateData }>
    ) {
      state.savedData[action.payload.templateId] = action.payload.data;
    },
    setAiPrompt(state, action: PayloadAction<string>) {
      state.aiPrompt = action.payload;
    },
    setAiLoading(state, action: PayloadAction<boolean>) {
      state.aiLoading = action.payload;
    },
    prefillFromAI(
      state,
      action: PayloadAction<{ templateId: string; data: TemplateData }>
    ) {
      state.savedData[action.payload.templateId] = action.payload.data;
      state.editMode = "manual";
      state.currentStep = 1;
      state.aiLoading = false;
      state.aiError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateWithAI.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(generateWithAI.fulfilled, (state, action) => {
        state.savedData[action.payload.templateId] = action.payload.data;
        state.aiLoading = false;
        state.editMode = "manual";
        state.currentStep = 1;
      })
      .addCase(generateWithAI.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = (action.payload as string) || "Something went wrong";
      });
  },
});

export const {
  setEditMode,
  setCurrentStep,
  nextStep,
  prevStep,
  resetEdit,
  updateTemplateField,
  setTemplateData,
  setAiPrompt,
  setAiLoading,
  prefillFromAI,
} = templateEditSlice.actions;

export default templateEditSlice.reducer;
