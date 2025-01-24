import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || "dummy_key"
);

// export const askGemini = async (
//   question: string,
//   summarizedTimetableContent: string
// ) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     // Get current date and time in EST
//     const estOptions = { timeZone: "America/New_York" };
//     const now = new Date();
//     const estDate = new Date(now.toLocaleString("en-US", estOptions));
//     const currentDay = estDate
//       .toLocaleDateString("en-US", { ...estOptions, weekday: "short" })
//       .toUpperCase()
//       .slice(0, 2);

//     const prompt = `
// You are a helpful and friendly timetable assistant. You are operating in Eastern Time (EST/EDT).
// Current date and time (EST): ${estDate.toLocaleString("en-US", estOptions)}
// Current day: ${currentDay}

// Below is the summarized timetable content that you need to analyze:

// ${summarizedTimetableContent}

// Internal Processing Instructions (DO NOT INCLUDE THESE STEPS IN YOUR RESPONSE):
// 1. Parse and validate UNTIL date from RRULE:
//    - Format is YYYYMMDD (e.g., UNTIL=20250112 means January 12, 2025).
//    - **If the current date is after the UNTIL date, the class is no longer active.** 
//    - **IMPORTANT: Do not show any classes that have passed their UNTIL date under any circumstances.**
   
// 2. Date and Time Processing:
//    - All dates and times in the timetable are in EST/EDT.
//    - Current EST date: ${estDate.toISOString().split("T")[0]}.
//    - Compare dates using EST timezone only.
//    - **When the user asks about "today," check for classes scheduled for the current date.**
//    - **When the user asks about "tomorrow," check for classes scheduled for the next day.**
   
// 3. Schedule Validation:
//    - Check BYDAY values against current/requested day.
//    - Only show classes that:
//      a) Have not reached their UNTIL date yet.
//      b) Match the requested day of the week.
//      c) Are scheduled for the specific date being asked about (today or tomorrow).

// Response Guidelines:
// - Be concise and natural in your responses.
// - Speak directly to the user in a friendly tone.
// - DO NOT explain your validation process.
// - DO NOT mention RRULE, BYDAY, or other technical terms.
// - If a class has ended (current date > UNTIL date), state: "This class is no longer in session. The last class was on [Month Day, Year]."
// - For active classes, include only:
//   * Class name
//   * Time and location
//   * Instructor name
//   * Any relevant schedule information
// - If no classes are found for a specific day, simply state: "You don't have any classes scheduled for [day]."
// - All times should be shown in EST/EDT.

// Question: ${question}

// Remember to respond in a natural, conversational way as if you're a helpful assistant speaking directly to the student.`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error calling Gemini API:", error);
//     return "Sorry, I encountered an error while processing your question.";
//   }
// };

export const askGemini = async (
  question: string,
  summarizedTimetableContent: string
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get current date and time in EST
    const estOptions = { timeZone: "America/New_York" };
    const now = new Date();
    const estDate = new Date(now.toLocaleString("en-US", estOptions));
    const currentDay = estDate
      .toLocaleDateString("en-US", { ...estOptions, weekday: "short" })
      .toUpperCase()
      .slice(0, 2);

    const prompt = `
You are a helpful and friendly timetable assistant. You are operating in Eastern Time (EST/EDT).
Current date and time (EST): ${estDate.toLocaleString("en-US", estOptions)}
Current day: ${currentDay}

Below is the summarized timetable content that you need to analyze:

${summarizedTimetableContent}

Internal Processing Instructions (DO NOT INCLUDE THESE STEPS IN YOUR RESPONSE):
1. Date and Time Processing:
   - All dates and times in the timetable are in EST/EDT and should be converted into a human-readable format.
   - Current EST date: ${estDate.toISOString().split("T")[0]}.
   - Compare dates using EST timezone only.
   - **When the user asks about "today," check for classes scheduled for the ${currentDay}**
   - **When the user asks about "tomorrow," check for classes scheduled for the next day.**

Response Guidelines:
- Be concise and natural in your responses.
- Speak directly to the user in a friendly tone.
- DO NOT explain your validation process.
- If a class has ended (current date > end date), state: "This class is no longer in session. The last class was on [Month Day, Year]."
- For active classes, include only:
  * Class name (derived from DESCRIPTION:Class Title)
  * Time and location
  * Instructor name
  * Any relevant schedule information
- If no classes are found for a specific day, simply state: "You don't have any classes scheduled for ${currentDay}."
- All times should be shown in EST/EDT.

Question: ${question}

Remember to respond in a natural, conversational way as if you're a helpful assistant speaking directly to the student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while processing your question.";
  }
};

export const summaryPrompt = async (timetableContent: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const summaryPrompt = `
    You are a summarization assistant. Please summarize the following timetable event in a concise manner, 
    focusing on the class name (derived from DESCRIPTION:Class Title), start date and time (derived from DTSTART and already in Eastern Standard Time (EST), convert it to a human-readable format), duration, end date (derived from UNTIL in RRULE), frequency, days of the week (from BYDAY in RRULE), location, and instructor details. 
    
    **Important:** If the current date is past the end date of the class, do not include this class in your summary.
    

${timetableContent}
    `;

    const summaryResponse = await model.generateContent(summaryPrompt);
    const summarizedTimetableContent = summaryResponse.response; // Assuming the response contains the summary directly
    console.log(
      "summarizedTimetableContent ",
      summarizedTimetableContent.text()
    );
    return summarizedTimetableContent.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while processing your question.";
  }
};
