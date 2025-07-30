const Data = [
    {
        img: './icon/generalenquiry.png',
        head: "General Enquiry",
        person1: [
            {
                name: "Unais",
                phone: "8078494673",
            }
        ],
        person2: [
            {
                name: "Eesa",
                phone: "9072341909",
            }
        ],
        person3: [
            {
                name: "Anand",
                phone: "9061564501",
            }
        ],
    },
    {
        img: './icon/it.png',
        head: "Information Technology",
        person1: [
            {
                name: "Eesa",
                phone: "9072341909",
            }
        ],
        person2: [
            {
                name: "Niswan",
                phone: "9061891616",
            }
        ],
        person3: [
            {
                name: "Sahil",
                phone: "7907176934",
            }
        ],
    },
    {
        img: './icon/ec.png',
        head: "Electronics & Communication Engineering",
        person1: [
            {
                name: "Hari",
                phone: "8590170265",
            }
        ],
        person2: [
            {
                name: "Rezin",
                phone: "8086982257",
            }
        ],
        person3: [
            {
                name: "Kiran",
                phone: "8086091942",
            }
        ],
    },
    {
        img: './icon/eee.png',
        head: "Electrical & Electronics Engineering",
        person1: [
            {
                name: "Shinan",
                phone: "8156808440",
            }
        ],
        person2: [
            {
                name: "Shahzad",
                phone: "8590465414",
            }
        ],
    },
    {
        img: './icon/cs.png',
        head: "Computer Science & Engineering",
        person1: [
            {
                name: "Maria",
                phone: "9072955673",
            }
        ],
        person2: [
            {
                name: "Sijin",
                phone: "8590912038",
            }
        ],
        person3: [
            {
                name: "Kiran S",
                phone: "8848259608",
            }
        ],
    },
    {
        img: './icon/civil.png',
        head: "Civil Engineering",
        person1: [
            {
                name: "Hani",
                phone: "9495556338",
            }
        ],
        person2: [
            {
                name: "Lara",
                phone: "8547244149",
            }
        ],
    },
    {
        img: './icon/mca.png',
        head: "MCA",
        person1: [
            {
                name: "Aslam",
                phone: "7994595108",
            }
        ],
        person2: [
            {
                name: "Amil",
                phone: "8129154915",
            }
        ],
    },
]

function loadData() {
    const container = document.getElementById("helpdeskCards");
    Object.assign(container.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '100px',

    })

    if (!container) return;
    container.innerHTML = "";

    Data.map(item => {
        const card = document.createElement("div");
        card.className = "card";
        Object.assign(card.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '30px',
            width: '250px'

        });
        const image = document.createElement("img");
        image.src = item.img;
        image.alt = item.head;
        image.style.width = "64px";
        image.style.height = "64px";
        image.style.objectFit = "contain";
        image.style.marginBottom = "12px";


        const heading = document.createElement("h2");
        heading.className = "heading";
        heading.textContent = item.head;
        heading.style.textAlign = 'center';
        card.append(image, heading);

        container.appendChild(card);

        card.addEventListener("click", () => {
            const modal = document.getElementById("modal");
            modal.style.width = "300px";

            document.getElementById("modalHead").textContent = item.head;
            document.getElementById("modalHead").style.textAlign = 'center';

            const modalContent = document.getElementById("modalContent");
            modalContent.innerHTML = "";

            [...(item.person1 || []), ...(item.person2 || []), ...(item.person3 || [])].forEach(person => {
                const p = document.createElement("p");
                p.innerHTML = `<strong>${person.name}</strong><br>${person.phone}`;
                modalContent.appendChild(p);
                p.style.textAlign = 'center';
            });

            document.getElementById("modal").style.display = "block";
            document.getElementById("overlay").style.display = "block";
        });


    });

}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("modal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
};

document.getElementById("overlay").onclick = () => {
    document.getElementById("modal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
};


window.onload = loadData;