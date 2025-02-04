document.addEventListener("DOMContentLoaded", function () {

  const generateForm = document.querySelector(".generate-form");
  const generateBtn = generateForm.querySelector(".generate-btn");
  const imageGallery = document.querySelector(".image-gallery");
  const errorMessage = document.querySelector("#error-message");

  // Use your actual OpenAI API key here
  const OPENAI_API_KEY = "your api key"; // Please keep this key safe and avoid exposing it publicly.
  let isImageGenerating = false;

  // Fixed number of images to generate
  const imageQuantity = 1;

  // Function to update image cards with generated images
  const updateImageCard = (imgDataArray) => {
      imgDataArray.forEach((imgObject, index) => {
          const imgCard = imageGallery.querySelectorAll(".img-card")[index];
          const imgElement = imgCard.querySelector("img");
          const downloadBtn = imgCard.querySelector(".download-btn");

          // Set the image source to the AI-generated image data
          const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
          imgElement.src = aiGeneratedImage;

          // When the image is loaded, remove the loading class and set download attributes
          imgElement.onload = () => {
              imgCard.classList.remove("loading");
              downloadBtn.setAttribute("href", aiGeneratedImage);
              downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
          };
      });
  };

  // Function to generate AI images by making a request to OpenAI API
  const generateAiImages = async (userPrompt) => {
      try {
          const response = await fetch("https://api.openai.com/v1/images/generations", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${OPENAI_API_KEY}`, // Ensure proper token format here
              },
              body: JSON.stringify({
                  prompt: userPrompt,
                  n: imageQuantity,  // Use the fixed quantity
                  size: "512x512", // Ensure this size is correct
                  response_format: "b64_json"
              }),
          });

          // Log the response status to check if the API request is successful
          console.log('API response status:', response.status);

          if (!response.ok) {
              const errorData = await response.json();
              console.error("API Error:", errorData);
              throw new Error("Failed to generate AI images. Check your API key.");
          }

          const { data } = await response.json();
          console.log('AI Image data:', data);  // Log the image data to verify it
          updateImageCard([...data]);
      } catch (error) {
          console.error("Error:", error);
          displayError(error.message);
      } finally {
          generateBtn.removeAttribute("disabled");
          generateBtn.innerText = "Generate";
          isImageGenerating = false;
      }
  };

  // Function to display error messages
  const displayError = (message) => {
      errorMessage.innerText = message;
      errorMessage.classList.remove("d-none");
  };

  // Handle form submission to generate AI images
  const handleImageGeneration = (e) => {
      e.preventDefault();

      if (isImageGenerating) return;

      const userPrompt = e.srcElement[0].value.trim();

      // Input validation
      if (!userPrompt) {
          displayError("Please enter a description.");
          return;
      }

      // Disable the generate button and update the loading state
      generateBtn.setAttribute("disabled", true);
      generateBtn.innerText = "Generating";
      isImageGenerating = true;

      // Creating HTML markup for loading state of image cards
      const imgCardMarkup = Array.from({ length: imageQuantity }, () =>
          `<div class="img-card loading">
              <img src="images/loader.svg" alt="Loading image">
              <a class="download-btn" href="#">Download</a>
          </div>`
      ).join("");

      imageGallery.innerHTML = imgCardMarkup;
      generateAiImages(userPrompt);
  };

  // Event listener for form submission
  generateForm.addEventListener("submit", handleImageGeneration);
});
