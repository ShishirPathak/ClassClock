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
    // console.log("summarizedTimetableContent\n", summarizedTimetableContent);

    // Get current date and time in EST
    const estOptions = { timeZone: "America/New_York" };
    const now = new Date();
    const estDate = new Date(now.toLocaleString("en-US", estOptions));
    // Get the current day
    const currentDay = estDate.toLocaleDateString("en-US", {
      ...estOptions,
      weekday: "long",
    });

    // Get yesterday
    const yesterdayDate = new Date(estDate);
    yesterdayDate.setDate(estDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString("en-US", {
      ...estOptions,
      weekday: "long",
    });

    // Get tomorrow
    const tomorrowDate = new Date(estDate);
    tomorrowDate.setDate(estDate.getDate() + 1);
    const tomorrow = tomorrowDate.toLocaleDateString("en-US", {
      ...estOptions,
      weekday: "long",
    });
    const prompt = `
You are a friendly timetable assistant operating in Eastern Time (EST/EDT). 
Current date and time (EST): ${estDate.toLocaleString("en-US", estOptions)}
Current day: ${currentDay}
Yesterday was: ${yesterday}
Tomorrow will be: ${tomorrow}

You have a narrative-like class schedule (summarized timetable content) for the user. Use this context to respond accurately to the user's questions:

${summarizedTimetableContent}

Response Guidelines:
- Be concise and friendly in your responses.
- Use full names for days of the week (e.g., use "Friday" instead of "FR").
- If the user asks about "today," "tomorrow," or "yesterday," check the summarized timetable content for classes scheduled on those days.
- For questions like "When is my next class?", "What is my next class?", "Where is my next class?", and "When is my next class going to start?", provide the relevant details based on the next scheduled class.
- If a class has ended, state: "This class is no longer in session. The last class was on [Month Day, Year]."
- If no classes are found for a specific day, respond with: "You don't have any classes scheduled for ${currentDay}."

Please note: Do not provide a list of sources or bibliography at the end of the response. Avoid mentioning specific dates when discussing the class schedule. Also do not mention specific times like "in 30 or 40 minutes" when discussing when a class will start.

Question: ${question}
`;

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
    You are an AI assistant tasked with transforming the provided ics file content into a narrative of the user's class schedule. 

    Imagine you're telling a story about the user's semester. Start with the class name from the SUMMARY field, then introduce the
    class title from the DESCRIPTION field. Describe when the class begins, using the start date and time from the DTSTART 
    field (note that times are in Eastern Standard Time (EST) and should be converted to a human-readable format). 
    Talk about how long each class lasts, using the duration from the DURATION field, and when the class ends, using the end date 
    from the UNTIL field in RRULE. Explain how often the class meets, using the frequency from the FREQ field in RRULE, and on which days of the week, 
    using the BYDAY field in RRULE. Finally, set the scene by describing the location from the LOCATION field, and introduce the instructor 
    using the name from the DESCRIPTION field. 
    
    Please note that if the current date is past the end date of the class, the class should not be included in the story. 
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
