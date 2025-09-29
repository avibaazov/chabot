document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const botId = urlParams.get("botId");
  document.getElementById("bot_id").value = botId;

  fetchExistingTrainingData(botId);
  document
    .getElementById("tag")
    .addEventListener("input", toggleTrainButtonBasedOnInputs);
  document
    .getElementById("add-pattern")
    .addEventListener("click", () =>
      addDynamicField("patterns-wrapper", "patterns")
    );
  document
    .getElementById("add-response")
    .addEventListener("click", () =>
      addDynamicField("responses-wrapper", "responses")
    );
  document.getElementById("add").addEventListener("click", addTrainingData);
  document.getElementById("train").addEventListener("click", trainBot);

  document.querySelectorAll(".patterns, .responses").forEach((input) => {
    input.addEventListener("input", toggleTrainButtonBasedOnInputs);
  });

  toggleTrainButtonBasedOnInputs(); // Initial check for input fields
});

let allTrainingData = [];

function fetchExistingTrainingData(botId) {
  fetch(`/get-existing-training-data/${botId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.trainingData && data.trainingData.length > 0) {
        allTrainingData.push(...data.trainingData);
        displayExistingTrainingData(data.trainingData);
        document.querySelector(".existing-tags-container").style.display =
          "flex";
      } else {
        document.querySelector(".existing-tags-container").style.display =
          "none";
      }
    })
    .catch((error) => console.error("Error:", error));
}

function areInputFieldsEmpty() {
  const tag = document.getElementById("tag").value;
  const patternInputs = getValuesFromDynamicFields("patterns");
  const responseInputs = getValuesFromDynamicFields("responses");
  return (
    tag === "" &&
    patternInputs.every((input) => input === "") &&
    responseInputs.every((input) => input === "")
  );
}

function toggleTrainButtonBasedOnInputs() {
  const trainButton = document.getElementById("train");
  const addButton = document.getElementById("add");
  trainButton.disabled = !areInputFieldsEmpty();
  addButton.disabled = areInputFieldsEmpty();
}

function displayExistingTrainingData(trainingDataArray, clearExisting = true) {
  const existingTagsContainer = document.querySelector(
    ".existing-tags-container"
  );
  const trainButton = document.getElementById("train");
  if (clearExisting) {
    existingTagsContainer.innerHTML = "";
  }
  trainingDataArray.forEach((trainingData) => {
    if (!trainingData.id) {
      trainingData.id = generateUniqueId();
    }
    const tagDiv = document.createElement("div");
    tagDiv.classList.add("tag-div");
    tagDiv.innerHTML = `
            <div class="tag-title">Tag: ${trainingData.tag}</div>
            <div>Patterns: ${trainingData.patterns.join(", ")}</div>
            <div>Responses: ${trainingData.responses.join(", ")}</div>
            <button class="delete-training-btn" data-id="${trainingData.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/>
                </svg>
            </button>
        `;
    existingTagsContainer.appendChild(tagDiv);
  });
  existingTagsContainer
    .querySelectorAll(".delete-training-btn")
    .forEach((button) => {
      button.addEventListener("click", deleteTrainingData);
    });
  existingTagsContainer.style.display =
    trainingDataArray.length > 0 ? "flex" : "none";
  toggleTrainButtonBasedOnInputs();
}

function deleteTrainingData(e) {
  const button = e.target.closest(".delete-training-btn");
  if (!button) {
    return;
  }
  const idToDelete = button.getAttribute("data-id");
  allTrainingData = allTrainingData.filter(
    (trainingData) => trainingData.id !== idToDelete
  );
  displayExistingTrainingData(allTrainingData);
}

function generateUniqueId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

function addTrainingData(e) {
  e.preventDefault();
  const tag = document.getElementById("tag").value;
  const patterns = getValuesFromDynamicFields("patterns");
  const responses = getValuesFromDynamicFields("responses");

  if (tag && patterns.length && responses.length) {
    // Check if the tag already exists
    const existingTrainingData = allTrainingData.find(
      (data) => data.tag === tag
    );

    if (existingTrainingData) {
      // Add patterns and responses to the existing tag
      existingTrainingData.patterns = Array.from(
        new Set([...existingTrainingData.patterns, ...patterns])
      );
      existingTrainingData.responses = Array.from(
        new Set([...existingTrainingData.responses, ...responses])
      );
      displayExistingTrainingData(allTrainingData);
    } else {
      // Add new training data
      const newTrainingData = {
        id: generateUniqueId(),
        tag,
        patterns,
        responses,
      };
      allTrainingData.push(newTrainingData);
      displayExistingTrainingData([newTrainingData], false);
    }

    resetForm();
    toggleTrainButtonBasedOnInputs();
  } else {
    alert("Please fill in all fields.");
  }
}

function trainBot(e) {
  e.preventDefault();
  if (
    !confirm(
      "Are you sure you want to retrain your bot? This might take some time."
    )
  ) {
    return;
  }
  const bot_id = document.getElementById("bot_id").value;
  fetch(`/save-form-data/${bot_id}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(allTrainingData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      allTrainingData = [];

      // Show training started message
      alert("Training started! We'll monitor the progress...");

      // Start polling for training status
      pollTrainingStatus(bot_id);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error saving training data: " + error.message);
    });
}

function pollTrainingStatus(bot_id) {
  const checkStatus = () => {
    fetch(`/training-status/${bot_id}`, {
      method: "GET",
      credentials: "include",
    })
    .then(response => response.json())
    .then(data => {
      console.log("Training status:", data);

      if (data.status === "completed") {
        alert("Training completed successfully!");
        window.location.reload();
      } else if (data.status === "failed") {
        alert("Training failed: " + data.message);
      } else if (data.status === "training" || data.status === "starting") {
        // Still training, check again in 5 seconds
        setTimeout(checkStatus, 5000);
      }
    })
    .catch(error => {
      console.error("Error checking training status:", error);
      // Stop polling on error
    });
  };

  // Start checking status after 2 seconds
  setTimeout(checkStatus, 2000);
}

function addDynamicField(wrapperId, className) {
  const wrapper = document.getElementById(wrapperId);
  const newInput = document.createElement("input");
  newInput.setAttribute("type", "text");
  newInput.setAttribute("class", className);
  newInput.setAttribute("name", className);
  newInput.setAttribute("required", "");
  newInput.addEventListener("input", toggleTrainButtonBasedOnInputs);
  wrapper.appendChild(newInput);
}

function getValuesFromDynamicFields(className) {
  const inputs = document.querySelectorAll("." + className);
  return Array.from(inputs)
    .map((input) => input.value.trim())
    .filter((value) => value);
}

function resetForm() {
  document.getElementById("tag").value = "";
  resetDynamicFields("patterns-wrapper", "patterns");
  resetDynamicFields("responses-wrapper", "responses");
}

function resetDynamicFields(wrapperId, className) {
  const wrapper = document.getElementById(wrapperId);
  const inputs = wrapper.getElementsByClassName(className);
  if (inputs.length > 0) {
    inputs[0].value = "";
  }
  while (inputs.length > 1) {
    wrapper.removeChild(inputs[1]);
  }
}
