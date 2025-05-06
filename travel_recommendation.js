const handleSearch = async () => {
    const keyword = document.getElementById('search').value.toLowerCase();
    console.log('Search keyword:', keyword);
    
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.classList.remove('hidden');
    
    const resultsElement = document.getElementById('results');
    resultsElement.innerHTML = '';
    
    try {
        const response = await fetch('travel_recommendation_api.json');
        const data = await response.json();
        
        let results = [];
        
        if (keyword === 'temples' || keyword === 'temple') {
            results = data.temples;
        } else if (keyword === 'beaches' || keyword === 'beach') { 
            results = data.beaches;
        } else if (keyword === 'countries' || keyword === 'country') {
            data.countries.forEach(country => {
                results = results.concat(country.cities);
            });
        } else {
            const allDestinations = [
                ...data.temples,
                ...data.beaches
            ];
            
            data.countries.forEach(country => {
                allDestinations.push(...country.cities);
            });
            
            results = allDestinations.filter(dest => 
                dest.name.toLowerCase().includes(keyword) || 
                dest.description.toLowerCase().includes(keyword)
            );
        }
        
        console.log('Results:', results);
        
        if (results.length > 0) {
            results.forEach(destination => {
                const timeZone = getTimeZoneForDestination(destination.name);
                const localTime = getLocalTime(timeZone);
                
                const card = document.createElement('div');
                card.className = 'destination-card bg-white rounded-lg overflow-hidden shadow-lg';
                card.innerHTML = `
                    <img src="${destination.imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-bold text-xl mb-2 text-gray-800">${destination.name}</h3>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-sm text-gray-500">Local Time:</span>
                            <span class="local-time text-sm font-medium bg-teal-100 text-teal-800 py-1 px-2 rounded" 
                                  data-timezone="${timeZone}">${localTime}</span>
                        </div>
                        <p class="text-gray-600 text-sm mb-4">${destination.description}</p>
                        <button class="bg-teal-500 text-white px-4 py-2 rounded text-sm hover:bg-teal-600 transition duration-200">
                            Visit
                        </button>
                    </div>
                `;
                resultsElement.appendChild(card);
            });
            
            startTimeUpdates();
        } else {
            resultsElement.innerHTML = `
                <div class="col-span-2 text-center text-white py-8">
                    No destinations found matching "${keyword}". Try another search term.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsElement.innerHTML = `
            <div class="col-span-2 text-center text-white py-8">
                Error loading destinations. Please try again later.
            </div>
        `;
    }
}

function getTimeZoneForDestination(destinationName) {
    const timeZoneMap = {
        "Sydney, Australia": "Australia/Sydney",
        "Melbourne, Australia": "Australia/Melbourne",
        "Tokyo, Japan": "Asia/Tokyo",
        "Kyoto, Japan": "Asia/Tokyo",
        "Rio de Janeiro, Brazil": "America/Sao_Paulo",
        "São Paulo, Brazil": "America/Sao_Paulo",
        
        "Angkor Wat, Cambodia": "Asia/Phnom_Penh",
        "Taj Mahal, India": "Asia/Kolkata",
        
        "Bora Bora, French Polynesia": "Pacific/Tahiti",
        "Copacabana Beach, Brazil": "America/Sao_Paulo"
    };
    
    return timeZoneMap[destinationName] || "UTC";
}

function getLocalTime(timeZone) {
    try {
        return new Date().toLocaleTimeString('en-US', {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error(`Error getting time for time zone ${timeZone}:`, error);
        return "Time unavailable";
    }
}

function updateAllLocalTimes() {
    const timeElements = document.querySelectorAll('.local-time');
    timeElements.forEach(element => {
        const timeZone = element.dataset.timezone;
        element.textContent = getLocalTime(timeZone);
    });
}

let timeUpdateInterval;
function startTimeUpdates() {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
    
    updateAllLocalTimes();
    
    timeUpdateInterval = setInterval(updateAllLocalTimes, 60000);
}

document.addEventListener('DOMContentLoaded', () => {
    handlePageChange('home');
    
    const clearButton = document.querySelector('#search-section button:nth-child(3)');
    clearButton.addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('results-container').classList.add('hidden');
        
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
            timeUpdateInterval = null;
        }
    });
});

const handlePageChange = (page) => {
    const searchSection = document.getElementById('search-section');
    const headText = document.getElementById('head-text');
    const subText = document.getElementById('sub-text');
    const contactSection = document.getElementById('contact-section');
    const resultsContainer = document.getElementById('results-container');

    document.getElementById('search').value = '';
    resultsContainer.classList.add('hidden');

    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }

    if (page === 'home') {
        contactSection.classList.add('hidden');
        searchSection.classList.remove('hidden');
        headText.innerHTML = 'EXPLORE DREAM DESTINATION';
        subText.innerHTML = "Explore your dream destination and let your imagination take flight. Whether it's the crystal-clear beaches of the Maldives, the historic streets of Rome, or the serene mountains of Japan, each place holds the promise of unforgettable memories. Embrace the adventure, discover new cultures, and create a journey that reflects your dreams—because the world is waiting for you to explore it.";
    }
    if(page === 'about'){
        contactSection.classList.add('hidden');
        searchSection.classList.add('hidden');
        headText.innerHTML = 'ABOUT US';
        subText.innerHTML = "we are a passionate travel agency dedicated to turning your dream getaways into reality. With personalized service, expert guidance, and curated travel experiences, we help you discover the world with ease and confidence. Whether you're seeking adventure, relaxation, or cultural exploration, we're here to craft unforgettable journeys tailored just for you.";
    }
    if(page === 'contact'){
        searchSection.classList.add('hidden');
        contactSection.classList.remove('hidden');
        headText.innerHTML = 'CONTACT US';
        subText.innerHTML = "we hope you enjoyed your visit to our travel agency website. If you have any questions, feedback, or inquiries, please don't hesitate to reach out. We're here to assist you in planning your dream getaway and making your travel experience unforgettable. Your satisfaction is our priority, and we look forward to hearing from you soon!";
    }
}