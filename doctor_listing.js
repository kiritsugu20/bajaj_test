let doctors = [];
let filteredDoctors = [];
let allSpecialties = new Set();

const searchInput = document.getElementById('doctor-search');
const suggestionsContainer = document.getElementById('suggestions-container');
const doctorList = document.getElementById('doctor-list');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const noResults = document.getElementById('no-results');
const specialtiesContainer = document.getElementById('specialties-container');


document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchDoctors();
        setupEventListeners();
        applyFiltersFromURL();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize the application.');
    }
});


async function fetchDoctors() {
    try {
        const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
        if (!response.ok) {
            throw new Error('Failed to fetch doctors data');
        }
        
        doctors = await response.json();
        filteredDoctors = [...doctors];
        
        doctors.forEach(doctor => {
            doctor.specialities.forEach(specialty => {
                allSpecialties.add(specialty.name);
            });
        });
        
        loadingIndicator.style.display = 'none';
        renderSpecialtiesFilter();
        renderDoctorList(filteredDoctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        showError('Failed to fetch doctors data. Please try again later.');
    }
}


function setupEventListeners() {
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() !== '' && suggestionsContainer.children.length > 0) {
            suggestionsContainer.style.display = 'block';
        }
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
        }, 200);
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applySearch(searchInput.value);
            suggestionsContainer.style.display = 'none';
        }
    });
    
    
    document.getElementById('video-consult').addEventListener('change', applyFilters);
    document.getElementById('in-clinic').addEventListener('change', applyFilters);
    
  
    document.getElementById('sort-fees').addEventListener('change', applyFilters);
    document.getElementById('sort-experience').addEventListener('change', applyFilters);
    
 
    window.addEventListener('popstate', () => {
        applyFiltersFromURL();
    });
}


function applyFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    
    const search = urlParams.get('search') || '';
    searchInput.value = search;
    
   
    const consultType = urlParams.get('consultType');
    if (consultType === 'video') {
        document.getElementById('video-consult').checked = true;
    } else if (consultType === 'clinic') {
        document.getElementById('in-clinic').checked = true;
    }
    
   
    const specialties = urlParams.getAll('specialty');
    const specialtyCheckboxes = document.querySelectorAll('[data-testid^="filter-specialty-"]');
    specialtyCheckboxes.forEach(checkbox => {
        const specialty = checkbox.value;
        checkbox.checked = specialties.includes(specialty);
    });
    
    
    const sortOption = urlParams.get('sort');
    if (sortOption === 'fees') {
        document.getElementById('sort-fees').checked = true;
    } else if (sortOption === 'experience') {
        document.getElementById('sort-experience').checked = true;
    }
    
   
    applyFilters();
}


function updateURL() {
    const urlParams = new URLSearchParams();
    

    if (searchInput.value.trim() !== '') {
        urlParams.append('search', searchInput.value.trim());
    }
    

    const videoConsult = document.getElementById('video-consult').checked;
    const inClinic = document.getElementById('in-clinic').checked;
    if (videoConsult) {
        urlParams.append('consultType', 'video');
    } else if (inClinic) {
        urlParams.append('consultType', 'clinic');
    }
    

    const checkedSpecialties = document.querySelectorAll('[data-testid^="filter-specialty-"]:checked');
    checkedSpecialties.forEach(checkbox => {
        urlParams.append('specialty', checkbox.value);
    });
    

    const sortFees = document.getElementById('sort-fees').checked;
    const sortExperience = document.getElementById('sort-experience').checked;
    if (sortFees) {
        urlParams.append('sort', 'fees');
    } else if (sortExperience) {
        urlParams.append('sort', 'experience');
    }
    

    const newURL = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    history.pushState({}, '', newURL);
}


function handleSearchInput() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.innerHTML = '';
        return;
    }
    
    const matchingDoctors = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm)
    ).slice(0, 3);
    
    if (matchingDoctors.length > 0) {
        renderSuggestions(matchingDoctors);
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.innerHTML = '';
    }
}


function renderSuggestions(matchingDoctors) {
    suggestionsContainer.innerHTML = '';
    
    matchingDoctors.forEach(doctor => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.setAttribute('data-testid', 'suggestion-item');
        suggestionItem.textContent = doctor.name;
        
        suggestionItem.addEventListener('click', () => {
            searchInput.value = doctor.name;
            suggestionsContainer.style.display = 'none';
            applySearch(doctor.name);
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
}

function applySearch(searchTerm) {
    searchInput.value = searchTerm;
    applyFilters();
}


function renderSpecialtiesFilter() {
    specialtiesContainer.innerHTML = '';
    
    
    const sortedSpecialties = Array.from(allSpecialties).sort();
    
    sortedSpecialties.forEach(specialty => {
        const formattedSpecialty = specialty.replace(/\//g, '-');
        const testId = `filter-specialty-${formattedSpecialty}`;
        
        const filterOption = document.createElement('div');
        filterOption.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `specialty-${formattedSpecialty}`;
        checkbox.value = specialty;
        checkbox.setAttribute('data-testid', testId);
        checkbox.addEventListener('change', applyFilters);
        
        const label = document.createElement('label');
        label.htmlFor = `specialty-${formattedSpecialty}`;
        label.textContent = specialty;
        
        filterOption.appendChild(checkbox);
        filterOption.appendChild(label);
        specialtiesContainer.appendChild(filterOption);
    });
}


function applyFilters() {
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const videoConsult = document.getElementById('video-consult').checked;
    const inClinic = document.getElementById('in-clinic').checked;
    const sortByFees = document.getElementById('sort-fees').checked;
    const sortByExperience = document.getElementById('sort-experience').checked;
    
    
    const selectedSpecialties = [];
    const specialtyCheckboxes = document.querySelectorAll('[data-testid^="filter-specialty-"]:checked');
    specialtyCheckboxes.forEach(checkbox => {
        selectedSpecialties.push(checkbox.value);
    });
    
    
    let result = [...doctors];
    
    
    if (searchTerm) {
        result = result.filter(doctor => 
            doctor.name.toLowerCase().includes(searchTerm)
        );
    }
    
    
    if (videoConsult) {
        result = result.filter(doctor => doctor.video_consult);
    } else if (inClinic) {
        result = result.filter(doctor => doctor.in_clinic);
    }
    
    
    if (selectedSpecialties.length > 0) {
        result = result.filter(doctor => 
            doctor.specialities.some(spec => 
                selectedSpecialties.includes(spec.name)
            )
        );
    }
    
    
    if (sortByFees) {
        result.sort((a, b) => {
            
            const aFees = parseInt(a.fees.replace(/[^\d]/g, ''));
            const bFees = parseInt(b.fees.replace(/[^\d]/g, ''));
            return aFees - bFees;
        });
    } else if (sortByExperience) {
        result.sort((a, b) => {
            
            const aExp = parseInt(a.experience.match(/\d+/)[0]);
            const bExp = parseInt(b.experience.match(/\d+/)[0]);
            return bExp - aExp; 
        });
    }
    
  
    filteredDoctors = result;
    renderDoctorList(filteredDoctors);
    
    
    updateURL();
}


function renderDoctorList(doctors) {
    
    Array.from(doctorList.children).forEach(child => {
        if (!['loading-indicator', 'error-message', 'no-results'].includes(child.id)) {
            doctorList.removeChild(child);
        }
    });
    
    if (doctors.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    doctors.forEach(doctor => {
        const doctorCard = createDoctorCard(doctor);
        doctorList.appendChild(doctorCard);
    });
}


function createDoctorCard(doctor) {
    const doctorCard = document.createElement('div');
    doctorCard.className = 'doctor-card';
    doctorCard.setAttribute('data-testid', 'doctor-card');
    
    
    const doctorImage = document.createElement('div');
    doctorImage.className = 'doctor-image';
    if (doctor.photo) {
        const img = document.createElement('img');
        img.src = doctor.photo;
        img.alt = doctor.name;
        img.className = 'doctor-image';
        doctorImage.innerHTML = '';
        doctorImage.appendChild(img);
    } else {
        doctorImage.style.backgroundColor = getRandomColor();
        doctorImage.textContent = doctor.name_initials || getInitials(doctor.name);
    }
    
    
    const doctorDetails = document.createElement('div');
    doctorDetails.className = 'doctor-details';
    
    
    const doctorName = document.createElement('h2');
    doctorName.className = 'doctor-name';
    doctorName.setAttribute('data-testid', 'doctor-name');
    doctorName.textContent = doctor.name;
    
    
    const doctorSpecialty = document.createElement('div');
    doctorSpecialty.className = 'doctor-specialty';
    doctorSpecialty.setAttribute('data-testid', 'doctor-specialty');
    doctorSpecialty.textContent = doctor.specialities.map(spec => spec.name).join(', ');
    
    
    const doctorMetadata = document.createElement('div');
    doctorMetadata.className = 'doctor-metadata';
    
    const doctorExperience = document.createElement('div');
    doctorExperience.className = 'doctor-experience';
    doctorExperience.setAttribute('data-testid', 'doctor-experience');
    doctorExperience.textContent = doctor.experience;
    
    const doctorFee = document.createElement('div');
    doctorFee.className = 'doctor-fee';
    doctorFee.setAttribute('data-testid', 'doctor-fee');
    doctorFee.textContent = doctor.fees;
    
    doctorMetadata.appendChild(doctorExperience);
    doctorMetadata.appendChild(doctorFee);
    
    
    const doctorLanguages = document.createElement('div');
    doctorLanguages.className = 'doctor-languages';
    doctorLanguages.textContent = `Languages: ${doctor.languages.join(', ')}`;
    
    
    const doctorClinic = document.createElement('div');
    doctorClinic.className = 'doctor-clinic';
    doctorClinic.textContent = doctor.clinic ? `Clinic: ${doctor.clinic.name}, ${doctor.clinic.address.locality}, ${doctor.clinic.address.city}` : '';
    
    
    const consultationBadges = document.createElement('div');
    consultationBadges.className = 'consultation-badges';
    
    if (doctor.video_consult) {
        const videoConsult = document.createElement('span');
        videoConsult.className = 'consultation-badge video-consult';
        videoConsult.textContent = 'Video Consult';
        consultationBadges.appendChild(videoConsult);
    }
    
    if (doctor.in_clinic) {
        const inClinic = document.createElement('span');
        inClinic.className = 'consultation-badge in-clinic';
        inClinic.textContent = 'In Clinic';
        consultationBadges.appendChild(inClinic);
    }
    
    
    doctorDetails.appendChild(doctorName);
    doctorDetails.appendChild(doctorSpecialty);
    doctorDetails.appendChild(doctorMetadata);
    doctorDetails.appendChild(doctorLanguages);
    doctorDetails.appendChild(doctorClinic);
    doctorDetails.appendChild(consultationBadges);
    
    
    doctorCard.appendChild(doctorImage);
    doctorCard.appendChild(doctorDetails);
    
    return doctorCard;
}


function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
}


function getRandomColor() {
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#2c3e50', '#27ae60', '#c0392b'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}


function showError(message) {
    loadingIndicator.style.display = 'none';
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}