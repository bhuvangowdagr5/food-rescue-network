const socket =
  io("http://localhost:5000");

function hideAll(){

  const pages = [
    "page1",
    "page2",
    "page3",
    "page4",
    "page5"
  ];

  pages.forEach((page) => {

    const element =
      document.getElementById(page);

    if(element){

      element.classList.remove("active");

    }

  });

}

async function goToRolePage(){

  let username =
    document.getElementById("username").value;

  let mobile =
    document.getElementById("mobile").value;

  let email =
    document.getElementById("email").value;

  let password =
    document.getElementById("password").value;

  let address =
    document.getElementById("address").value;

  let role =
    document.getElementById("role").value;

  if(
    username == "" ||
    mobile == "" ||
    email == "" ||
    password == "" ||
    address == ""
  ){

    alert("Please fill all details");

    return;

  }

  const response = await fetch(

    "http://localhost:5000/signup",

    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        username,
        mobile,
        email,
        password,
        role

      })

    }

  );

  const data =
    await response.json();

  if(data.success){

    alert("Signup Successful 🎉");

    document.getElementById("welcomeText")
      .innerHTML =
      "Welcome " + username + " 👋";

    hideAll();

    document.getElementById("page2")
      .classList.add("active");

  } else {

    alert(data.message);

  }

}

function showDonorPage(){

  hideAll();

  document.getElementById("page3")
    .classList.add("active");

}

function showAcceptorPage(){

  hideAll();

  document.getElementById("page4")
    .classList.add("active");

  loadDonations();

}

function backToRole(){

  hideAll();

  document.getElementById("page2")
    .classList.add("active");

}

async function submitDonation(){

  let food =
    document.getElementById("foodName").value;

  let foodType =
    document.getElementById("foodType").value;

  let condition =
    document.getElementById("foodCondition").value;

  let quantity =
    document.getElementById("quantity").value;

  let location =
    document.getElementById("location").value;

  let details =
  document.getElementById("details")
  .value;

  let expiryTime =
    document.getElementById(
      "expiryTime"
    ).value;
    

  if(
    food == "" ||
    foodType == "" ||
    condition == "" ||
    quantity == "" ||
    location == "" ||
    details == ""
  ){

    alert("Please fill all food details");

    return;

  }

  let image =
  document.getElementById("foodImage")
    .files[0];

const formData =
  new FormData();

formData.append(
  "foodName",
  food
);

formData.append(
  "foodType",
  foodType
);

formData.append(
  "condition",
  condition
);

formData.append(
  "quantity",
  quantity
);

formData.append(
  "location",
  location
);

formData.append(
  "details",
  details
);

formData.append(
  "expiryTime",
  expiryTime
);

formData.append(
  "foodImage",
  image
);

const response = await fetch(

  "http://localhost:5000/donate",

  {

    method: "POST",

    body: formData

  }

);

const data =
  await response.json();

  if(data.success){

  let whatsappMessage =

`🍱 Food Donation Available

Food: ${food}

Type: ${foodType}

Quantity: ${quantity}

Location: ${location}

Details: ${details}`;

  let whatsappURL =

`https://wa.me/?text=${encodeURIComponent(
  whatsappMessage
)}`;

  window.open(
    whatsappURL,
    "_blank"
  );

  alert(
    "Donation Submitted Successfully 🎉"
  );

  document.getElementById("foodName").value = "";

  document.getElementById("foodType").value = "";

  document.getElementById("foodCondition").value = "";

  document.getElementById("quantity").value = "";

  document.getElementById("location").value = "";

  document.getElementById("details").value = "";

  loadDonations();

} else {

    alert("Error saving donation");

  }

}

async function acceptDonation(button, id){

  try {

    const response = await fetch(

      "http://localhost:5000/accept/" + id,

      {
        method: "PUT"
      }

    );

    const data =
      await response.json();

    if(data.success){

      alert(
        "Food accepted successfully 🍱"
      );

      button.innerHTML =
        "Accepted ✅";

      button.disabled = true;

      loadDonations();

    } else {

      alert(
        "Accept failed"
      );

    }

  } catch(error){

    console.log(error);

    alert(
      "Server error"
    );

  }

}

function checkEmptyDonations(){

  let donationList =
    document.getElementById("donationList");

  let emptyMessage =
    document.getElementById("emptyMessage");

  if(donationList.children.length == 0){

    emptyMessage.style.display = "block";

  } else {

    emptyMessage.style.display = "none";

  }

}

async function loadDonations(){

  const response =
    await fetch(
      "http://localhost:5000/donations"
    );

  const donations =
    await response.json();

  let donationList =
    document.getElementById("donationList");

  donationList.innerHTML = "";

  donations.forEach((item) => {

    let card =
      document.createElement("div");

    card.className =
      "donation-card";

    card.innerHTML = `

      <h3>🍱 ${item.foodName}</h3>

      <img
        src="http://localhost:5000/uploads/${item.image}"
        width="250">

      <p>
        <b>Food Type:</b>
        ${item.foodType}
      </p>

      <p>
        <b>Condition:</b>
        ${item.condition}
      </p>

      <p>
        <b>Quantity:</b>
        ${item.quantity}
      </p>

      <p>
        <b>Location:</b>
        ${item.location}
      </p>

      <p>
        <b>Details:</b>
        ${item.details}
      </p>

      <p>
        ⏳ Expires In:
        <span id="timer-${item._id}">
          Loading...
        </span>
      </p>

      <button
        onclick="acceptDonation(this, '${item._id}')">

        Accept Food ✅

      </button>

    `;

    donationList.appendChild(card);

    if(item.expiresAt){

      startCountdown(

        item._id,

        item.expiresAt

      );

    }

  });

}

function showLoginPage(){

  hideAll();

  document.getElementById("page5")
    .classList.add("active");

}

function backToSignup(){

  hideAll();

  document.getElementById("page1")
    .classList.add("active");

}

async function loginUser(){

  let email =
    document.getElementById("loginEmail").value;

  let password =
    document.getElementById("loginPassword").value;

  if(email == "" || password == ""){

    alert("Please fill all details");

    return;

  }

  try {

    const response = await fetch(

      "http://localhost:5000/login",

      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          email,
          password

        })

      }

    );

    const data =
      await response.json();

    if(data.success){

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Login Successful 🎉");

      document.getElementById(
        "welcomeText"
      ).innerHTML =
        "Welcome " +
        data.user.username +
        " 👋";

      hideAll();

      document.getElementById(
        "page2"
      ).classList.add("active");

    } else {

      alert(data.message);

    }

  } catch(error){

    alert("Server error");

    console.log(error);

  }

}
function logoutUser(){

  localStorage.removeItem("token");

  localStorage.removeItem("user");

  localStorage.clear();

  alert("Logged out successfully");

  hideAll();

  document.getElementById("page1")
    .classList.add("active");

}

window.onload = function(){

  const token =
    localStorage.getItem("token");

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  if(token && user){

    document.getElementById("welcomeText")
      .innerHTML =
      "Welcome " +
      user.username +
      " 👋";

    hideAll();

    document.getElementById("page2")
      .classList.add("active");

  }

};
async function getLocation(){

  if(navigator.geolocation){

    navigator.geolocation.getCurrentPosition(

      async function(position){

        let latitude =
          position.coords.latitude;

        let longitude =
          position.coords.longitude;

        try {

          const response =
            await fetch(

              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

            );

          const data =
            await response.json();

          document.getElementById("location")
            .value =
            data.display_name;

          alert(
            "Location detected successfully 📍"
          );

        } catch(error){

          alert(
            "Error getting location name"
          );

        }

      },

      function(){

        alert(
          "Unable to get location"
        );

      }

    );

  } else {

    alert(
      "Geolocation not supported"
    );

  }

}
socket.on(

  "newDonation",

  (donation) => {

    alert(
      "🍱 New food donation received!"
    );

    loadDonations();

  }

);

function startCountdown(id, expiresAt){

  const timer =
    document.getElementById(
      `timer-${id}`
    );

  function updateTimer(){

    const now =
      new Date().getTime();

    const expiry =
      new Date(expiresAt).getTime();

    const distance =
      expiry - now;

    if(distance <= 0){

      timer.innerHTML =
        "Expired ❌";

      return;

    }

    const hours =
      Math.floor(
        distance /
        (1000 * 60 * 60)
      );

    const minutes =
      Math.floor(
        (distance %
        (1000 * 60 * 60)) /
        (1000 * 60)
      );

    const seconds =
      Math.floor(
        (distance %
        (1000 * 60)) /
        1000
      );

    timer.innerHTML =

      hours + "h " +

      minutes + "m " +

      seconds + "s";

  }

  updateTimer();

  setInterval(updateTimer, 1000);

}