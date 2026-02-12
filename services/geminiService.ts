
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Transaction, Invoice } from "../types";

// تأكد من ضبط API_KEY في إعدادات Vercel
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const cleanAIResponse = (text: string | undefined): string => {
  if (!text) return "لا يوجد رد.";
  return text
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/Thought:[\s\S]*?\n/gi, '')
    .trim();
};

export const analyzeReceiptImage = async (base64Data: string, mimeType: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `حلل صورة الفاتورة المرفقة واستخرج البيانات التالية بدقة:
    1. المبلغ الصافي (قبل الضريبة).
    2. مبلغ الضريبة (VAT): إذا كانت الضريبة موجودة في الصورة، استخرج قيمتها. إذا لم تكن موجودة أو لم تذكر، يجب أن تكون القيمة 0.
    3. التاريخ.
    4. اسم المورد.
    5. وصف مختصر.
    6. الفئة (materials, fuel, admin_expenses, other).
    
    العملة المطلوبة هي دينار بحريني (BD).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: mimeType } }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: "المبلغ الصافي بدون ضريبة" },
              tax_amount: { type: Type.NUMBER, description: "مبلغ الضريبة، 0 إذا لم توجد" },
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              supplier: { type: Type.STRING },
              reference_code: { type: Type.STRING }
            },
            required: ["amount", "tax_amount", "date", "description", "category", "supplier", "reference_code"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Receipt Analysis Error:", error);
    throw error;
  }
};

export const analyzeAttendanceFile = async (content: string, isImage: boolean = false, mimeType: string = "") => {
  const model = "gemini-3-flash-preview";
  const prompt = `حلل سجل الحضور بدقة عالية. استخرج البيانات لـ المهندس حسين، المهندس أحمد، والسيلز. المطلوب مصفوفة JSON تحتوي على الموظف، التاريخ، وقت الدخول، وقت الخروج، والحالة.`;

  try {
    let contents: any;
    if (isImage) {
      contents = { parts: [{ text: prompt }, { inlineData: { data: content, mimeType: mimeType } }] };
    } else {
      contents = { parts: [{ text: prompt }, { text: content }] };
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              employee: { type: Type.STRING },
              date: { type: Type.STRING },
              checkIn: { type: Type.STRING },
              checkOut: { type: Type.STRING },
              status: { type: Type.STRING }
            },
            required: ["employee", "date", "checkIn", "checkOut", "status"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Attendance Analysis Error:", error);
    throw error;
  }
};

export const getAIChatResponse = async (
  userMessage: string, 
  projects: Project[], 
  transactions: Transaction[], 
  invoices: Invoice[],
  chatHistory: any[]
) => {
  const model = "gemini-3-flash-preview";
  const systemContext = `أنت مساعد مالي ذكي لنظام "بناء". أجب باختصار شديد وبالأرقام بناءً على: ${JSON.stringify({ projects, transactions, invoices })}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: systemContext }] }, ...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
      config: { temperature: 0.1 }
    });
    return cleanAIResponse(response.text);
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "خطأ في المعالجة.";
  }
};
