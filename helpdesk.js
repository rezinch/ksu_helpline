// helpdesk.js

const Data = [
  {
    img: './icon/generalenquiry.png',
    head: "General Enquiry",
    person1: [{ name: "Unais", phone: "8078494673" }],
    person2: [{ name: "Eesa", phone: "9072341909" }],
    person3: [{ name: "Anand", phone: "9061564501" }]
  },
  {
    img: './icon/it.png',
    head: "Information Technology",
    person1: [{ name: "Eesa", phone: "9072341909" }],
    person2: [{ name: "Niswan", phone: "9061891616" }],
    person3: [{ name: "Sahil", phone: "7907176934" }]
  },
  {
    img: './icon/ec.png',
    head: "Electronics & Communication Engineering",
    person1: [{ name: "Hari", phone: "8590170265" }],
    person2: [{ name: "Rezin", phone: "8086982257" }],
    person3: [{ name: "Kiran", phone: "8086091942" }]
  },
  {
    img: './icon/eee.png',
    head: "Electrical & Electronics Engineering",
    person1: [{ name: "Shinan", phone: "8156808440" }],
    person2: [{ name: "Shahzad", phone: "8590465414" }]
  },
  {
    img: './icon/cs.png',
    head: "Computer Science & Engineering",
    person1: [{ name: "Maria", phone: "9072955673" }],
    person2: [{ name: "Sijin", phone: "8590912038" }],
    person3: [{ name: "Kiran S", phone: "8848259608" }]
  },
  {
    img: './icon/civil.png',
    head: "Civil Engineering",
    person1: [{ name: "Hani", phone: "9495556338" }],
    person2: [{ name: "Lara", phone: "8547244149" }]
  },
  {
    img: './icon/mca.png',
    head: "MCA",
    person1: [{ name: "Aslam", phone: "7994595108" }],
    person2: [{ name: "Amil", phone: "8129154915" }]
  }
];

function loadHelpdeskData() {
  const container = document.getElementById("helpdeskCards");
  if (!container) return;

  // Clear any previous cards and inline styles
  container.innerHTML = "";
  container.style.cssText = null;

  Data.forEach(item => {
    // Create a figure element for better semantics and styling
    const card = document.createElement("figure");
    // Use the existing CSS classes from your stylesheet for a consistent look
    card.className = "qr-card hover-lift"; 

    // The modal logic works inside the click listener
    card.addEventListener("click", () => {
      const modal = document.getElementById("modal");
      modal.style.width = "300px";
      modal.classList.remove('zoom-out');
      modal.classList.add('zoom-in');

      document.getElementById("modalHead").textContent = item.head;
      document.getElementById("modalHead").style.textAlign = 'center';

      const modalContent = document.getElementById("modalContent");
      modalContent.innerHTML = "";

      [...(item.person1 || []), ...(item.person2 || []), ...(item.person3 || [])].forEach(person => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${person.name}</strong><br>${person.phone}`;
        p.style.textAlign = 'center';
        modalContent.appendChild(p);
      });

      document.getElementById("modal").style.display = "block";
      document.getElementById("overlay").classList.add('show');
    });

    // Populate the card using innerHTML for simplicity, matching your other cards
    card.innerHTML = `
      <div class="qr-placeholder">
        <img src="${item.img}" alt="" style="width: 3.5rem; height: 3.5rem; object-fit: contain;">
      </div>
      <figcaption>${item.head}</figcaption>
    `;

    container.appendChild(card);
  });
}

// Modal closing logic
document.getElementById("closeModal").onclick = () => {
  const modal = document.getElementById("modal");
  modal.classList.remove('zoom-in');
  modal.classList.add('zoom-out');
  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("overlay").classList.remove('show');
  }, 200);
};

document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target.id === "overlay") {
    const modal = document.getElementById("modal");
    modal.classList.remove('zoom-in');
    modal.classList.add('zoom-out');
    setTimeout(() => {
      modal.style.display = "none";
      document.getElementById("overlay").classList.remove('show');
    }, 200);
  }
});


// Load the data when the script runs
loadHelpdeskData();