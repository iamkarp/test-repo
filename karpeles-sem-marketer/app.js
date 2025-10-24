// Karpeles Museum SEM Automatic Marketer
// Data Store
const semData = {
    keywords: [],
    ads: [],
    campaigns: [],
    landingPages: [],
    analytics: {}
};

// Museum Data
const museumData = {
    locations: {
        tacoma: { city: 'Tacoma', state: 'WA', population: 220000 },
        buffalo: { city: 'Buffalo', state: 'NY', population: 278000 },
        charleston: { city: 'Charleston', state: 'SC', population: 150000 },
        jacksonville: { city: 'Jacksonville', state: 'FL', population: 950000 },
        'santa-ana': { city: 'Santa Ana', state: 'CA', population: 310000 }
    },
    collections: {
        historical: ['Declaration of Independence', 'Bill of Rights', 'Gettysburg Address', 'Emancipation Proclamation'],
        manuscripts: ['Shakespeare First Folio', 'Beethoven Scores', 'Da Vinci Notebooks', 'Ancient Maps'],
        educational: ['American History', 'World History', 'Science & Discovery', 'Arts & Literature'],
        family: ['Interactive Exhibits', 'Guided Tours', 'Educational Programs', 'Special Events']
    }
};

// Keyword Generator
class KeywordGenerator {
    constructor() {
        this.baseKeywords = {
            general: [
                'free museum', 'free admission museum', 'museum near me', 'historical museum',
                'manuscript library', 'rare documents', 'historical documents museum',
                'educational museum', 'family museum', 'things to do'
            ],
            location: [
                '{city} museum', '{city} attractions', 'museums in {city}',
                'free things to do in {city}', '{city} historical sites',
                'what to do in {city}', '{city} family activities'
            ],
            collection: [
                '{collection} exhibit', 'see {collection}', '{collection} museum',
                'view {collection}', '{collection} display', 'original {collection}'
            ],
            intent: [
                'plan museum visit', 'museum hours', 'museum admission',
                'school field trip museum', 'educational tours', 'group tours'
            ]
        };
    }

    generate(location = 'all', theme = 'all') {
        const keywords = [];
        const locations = location === 'all' ? Object.keys(museumData.locations) : [location];

        // General keywords
        this.baseKeywords.general.forEach(kw => {
            keywords.push({
                keyword: kw,
                type: 'Broad Match',
                searchVolume: this.estimateSearchVolume(kw),
                competition: 'Low',
                suggestedBid: this.estimateBid(kw)
            });
        });

        // Location-based keywords
        locations.forEach(loc => {
            const locData = museumData.locations[loc];
            this.baseKeywords.location.forEach(template => {
                const kw = template.replace('{city}', locData.city);
                keywords.push({
                    keyword: kw,
                    type: 'Phrase Match',
                    searchVolume: this.estimateSearchVolume(kw, locData.population),
                    competition: 'Medium',
                    suggestedBid: this.estimateBid(kw),
                    location: loc
                });
            });
        });

        // Collection-based keywords
        if (theme !== 'all' && museumData.collections[theme]) {
            museumData.collections[theme].forEach(collection => {
                this.baseKeywords.collection.forEach(template => {
                    const kw = template.replace('{collection}', collection);
                    keywords.push({
                        keyword: kw,
                        type: 'Exact Match',
                        searchVolume: this.estimateSearchVolume(kw),
                        competition: 'Low',
                        suggestedBid: this.estimateBid(kw),
                        theme: theme
                    });
                });
            });
        }

        // Intent-based keywords
        this.baseKeywords.intent.forEach(kw => {
            keywords.push({
                keyword: kw,
                type: 'Phrase Match',
                searchVolume: this.estimateSearchVolume(kw),
                competition: 'Medium',
                suggestedBid: this.estimateBid(kw)
            });
        });

        // Add negative keywords
        const negativeKeywords = [
            'museum jobs', 'museum employment', 'museum for sale',
            'museum donations', 'expensive museum', 'museum ticket prices'
        ];

        return {
            positiveKeywords: keywords,
            negativeKeywords: negativeKeywords,
            totalCount: keywords.length
        };
    }

    estimateSearchVolume(keyword, populationFactor = 1000000) {
        const baseVolume = Math.floor(Math.random() * 1000) + 100;
        const factor = populationFactor / 1000000;
        return Math.floor(baseVolume * factor);
    }

    estimateBid(keyword) {
        const isCompetitive = keyword.includes('near me') || keyword.includes('free');
        const base = isCompetitive ? 0.50 : 0.25;
        return (base + Math.random() * 0.50).toFixed(2);
    }
}

// Ad Copy Generator
class AdCopyGenerator {
    constructor() {
        this.headlines = {
            general: [
                'Visit Karpeles Museum - Always Free!',
                'Free Admission to Historical Museum',
                'Explore Rare Manuscripts & Documents',
                'Karpeles Manuscript Library Museum'
            ],
            free: [
                '100% Free Museum Admission',
                'No Admission Fee Ever - Visit Today',
                'Free Family-Friendly Museum',
                'Always Free - No Tickets Required'
            ],
            educational: [
                'Educational Museum Tours Available',
                'Perfect for School Field Trips',
                'Learning Through History',
                'Interactive Educational Exhibits'
            ],
            family: [
                'Fun Family Museum Experience',
                'Kid-Friendly Historical Museum',
                'Family Activities & Exhibits',
                'Educational Fun for All Ages'
            ],
            historical: [
                'See Original Historical Documents',
                'Rare Manuscripts on Display',
                'History Comes Alive Here',
                'View Priceless Historical Artifacts'
            ]
        };

        this.descriptions = {
            general: [
                'Discover original manuscripts & historical documents. Free admission, open to the public. Plan your visit today!',
                'View rare documents including the Declaration of Independence, Bill of Rights & more. Always free admission.',
                'Experience history firsthand with our rotating exhibits of rare manuscripts and historical documents.'
            ],
            free: [
                'Enjoy world-class exhibits at no cost. Free parking, free admission, open year-round. Perfect for families!',
                'No hidden fees, no tickets required. Just walk in and explore American history for free.',
                'Quality museum experience without the cost. Donations welcome but never required.'
            ],
            educational: [
                'Ideal for students and teachers. Educational programs available. Free admission for school groups.',
                'Enhance learning with real historical documents. Schedule your educational tour today.',
                'Bring history to life for your students. Free field trips, educational resources available.'
            ]
        };

        this.callsToAction = [
            'Visit Today', 'Plan Your Visit', 'Find Location Near You',
            'Book Your Tour', 'Explore Now', 'Learn More'
        ];
    }

    generate(adType = 'search', theme = 'general') {
        const ads = [];
        const headlinePool = this.headlines[theme] || this.headlines.general;
        const descPool = this.descriptions[theme] || this.descriptions.general;

        if (adType === 'responsive') {
            // Responsive Search Ads (multiple headlines and descriptions)
            const ad = {
                type: 'Responsive Search Ad',
                headlines: headlinePool.slice(0, 4),
                descriptions: descPool.slice(0, 2),
                path1: 'free-admission',
                path2: 'visit-today',
                finalUrl: 'https://www.karpeles.com'
            };
            ads.push(ad);
        } else {
            // Standard Search Ads
            for (let i = 0; i < Math.min(3, headlinePool.length); i++) {
                const ad = {
                    type: 'Search Ad',
                    headline: headlinePool[i],
                    headline2: headlinePool[(i + 1) % headlinePool.length],
                    description: descPool[i % descPool.length],
                    displayUrl: 'www.karpeles.com/visit',
                    finalUrl: 'https://www.karpeles.com',
                    callToAction: this.callsToAction[i % this.callsToAction.length],
                    estimatedCTR: (2.5 + Math.random() * 2).toFixed(2) + '%',
                    qualityScore: Math.floor(Math.random() * 3) + 7
                };
                ads.push(ad);
            }
        }

        return ads;
    }

    generateVariations(baseAd) {
        const variations = [];
        for (let i = 0; i < 3; i++) {
            const variation = { ...baseAd };
            variation.variant = `Variation ${i + 1}`;
            variation.estimatedCTR = (2.0 + Math.random() * 3).toFixed(2) + '%';
            variations.push(variation);
        }
        return variations;
    }
}

// Campaign Structure Generator
class CampaignGenerator {
    generate(budget, goal) {
        const campaigns = [];
        const budgetSplit = this.calculateBudgetSplit(budget, goal);

        // Brand Campaign
        campaigns.push({
            name: 'Karpeles Museum - Brand',
            type: 'Search',
            budget: budgetSplit.brand,
            bidStrategy: 'Maximize Clicks',
            targetLocations: 'All Museum Locations',
            keywords: 25,
            adGroups: [
                { name: 'Brand Terms', keywords: 10, ads: 3 },
                { name: 'Karpeles + Location', keywords: 15, ads: 3 }
            ],
            estimatedImpressions: Math.floor(budget * 100),
            estimatedClicks: Math.floor(budget * 5)
        });

        // Free Admission Campaign
        campaigns.push({
            name: 'Free Museum Admission',
            type: 'Search',
            budget: budgetSplit.free,
            bidStrategy: 'Target CPA',
            targetCPA: '$2.50',
            targetLocations: 'All Museum Locations',
            keywords: 40,
            adGroups: [
                { name: 'Free Museum - General', keywords: 15, ads: 4 },
                { name: 'Free Things To Do', keywords: 15, ads: 4 },
                { name: 'Free Family Activities', keywords: 10, ads: 3 }
            ],
            estimatedImpressions: Math.floor(budget * 150),
            estimatedClicks: Math.floor(budget * 7.5)
        });

        // Location-Specific Campaigns
        campaigns.push({
            name: 'Museum Locations - Near Me',
            type: 'Search',
            budget: budgetSplit.location,
            bidStrategy: 'Maximize Conversions',
            targetLocations: 'Geo-targeted by Museum Location',
            radius: '25 miles',
            keywords: 50,
            adGroups: Object.keys(museumData.locations).map(loc => ({
                name: `${museumData.locations[loc].city} Museum`,
                keywords: 10,
                ads: 3
            })),
            estimatedImpressions: Math.floor(budget * 120),
            estimatedClicks: Math.floor(budget * 6)
        });

        // Educational/School Campaign
        campaigns.push({
            name: 'Educational & School Groups',
            type: 'Search',
            budget: budgetSplit.educational,
            bidStrategy: 'Manual CPC',
            maxCPC: '$0.75',
            targetLocations: 'All Museum Locations',
            keywords: 30,
            adGroups: [
                { name: 'School Field Trips', keywords: 10, ads: 3 },
                { name: 'Educational Tours', keywords: 10, ads: 3 },
                { name: 'Learning Resources', keywords: 10, ads: 3 }
            ],
            estimatedImpressions: Math.floor(budget * 80),
            estimatedClicks: Math.floor(budget * 4)
        });

        // Display Campaign
        if (budget >= 500) {
            campaigns.push({
                name: 'Display - Historical Interest',
                type: 'Display',
                budget: budgetSplit.display,
                bidStrategy: 'Target CPM',
                targetCPM: '$3.00',
                targeting: 'Affinity: History Buffs, Education, Museums',
                placements: 'Google Display Network',
                adFormats: ['Responsive Display Ads', 'Image Ads'],
                estimatedImpressions: Math.floor(budget * 300),
                estimatedClicks: Math.floor(budget * 3)
            });
        }

        return campaigns;
    }

    calculateBudgetSplit(totalBudget, goal) {
        const splits = {
            awareness: { brand: 0.15, free: 0.35, location: 0.30, educational: 0.15, display: 0.05 },
            traffic: { brand: 0.20, free: 0.40, location: 0.25, educational: 0.10, display: 0.05 },
            visits: { brand: 0.15, free: 0.30, location: 0.40, educational: 0.10, display: 0.05 },
            engagement: { brand: 0.25, free: 0.25, location: 0.25, educational: 0.20, display: 0.05 }
        };

        const split = splits[goal] || splits.traffic;
        return {
            brand: Math.floor(totalBudget * split.brand),
            free: Math.floor(totalBudget * split.free),
            location: Math.floor(totalBudget * split.location),
            educational: Math.floor(totalBudget * split.educational),
            display: Math.floor(totalBudget * split.display)
        };
    }
}

// Landing Page Content Generator
class LandingPageGenerator {
    generate(pageType) {
        const pages = {
            homepage: {
                title: 'Welcome to Karpeles Manuscript Library Museums',
                headline: 'Explore History for Free',
                subheadline: 'View Original Historical Documents & Rare Manuscripts',
                heroText: 'The Karpeles Manuscript Library Museums house the world\'s largest private collection of original manuscripts and documents. With locations across the United States, we offer free admission to everyone.',
                cta: 'Find a Museum Near You',
                sections: [
                    {
                        title: 'Always Free Admission',
                        content: 'We believe history should be accessible to everyone. All our museums offer completely free admission, every day we\'re open. No tickets, no reservations required.'
                    },
                    {
                        title: 'World-Class Exhibits',
                        content: 'See original documents like the Bill of Rights, Declaration of Independence, and manuscripts from Shakespeare, Beethoven, and more.'
                    },
                    {
                        title: 'Educational Programs',
                        content: 'Perfect for school groups and learners of all ages. We offer guided tours and educational resources at no cost.'
                    }
                ],
                seo: {
                    title: 'Free Museum | Karpeles Manuscript Library | Historical Documents',
                    description: 'Visit Karpeles Manuscript Library Museums - Free admission to view original historical documents and rare manuscripts. Locations nationwide.',
                    keywords: 'free museum, historical documents, manuscripts, museum near me, free admission'
                }
            },
            location: {
                title: 'Visit Our Museums',
                headline: 'Find a Location Near You',
                locations: Object.entries(museumData.locations).map(([key, loc]) => ({
                    name: `${loc.city}, ${loc.state}`,
                    address: `Karpeles Manuscript Library Museum - ${loc.city}`,
                    hours: 'Tuesday-Sunday, 10am-4pm',
                    admission: 'FREE',
                    features: ['Free Parking', 'Wheelchair Accessible', 'Group Tours Available']
                })),
                cta: 'Get Directions',
                seo: {
                    title: 'Museum Locations | Free Admission | Karpeles Manuscript Library',
                    description: 'Find a Karpeles Museum near you. Free admission at all locations. Open to the public with exhibits of historical documents.',
                    keywords: 'museum locations, free museum near me, historical museum'
                }
            },
            exhibit: {
                title: 'Current Exhibits',
                headline: 'View Priceless Historical Documents',
                exhibits: [
                    {
                        name: 'Founding Documents of America',
                        description: 'Original copies and rare printings of the Declaration of Independence, Constitution, and Bill of Rights.',
                        duration: 'Ongoing'
                    },
                    {
                        name: 'Literary Masterpieces',
                        description: 'Manuscripts from Shakespeare, Dickens, Twain and other literary giants.',
                        duration: 'Rotating Exhibit'
                    },
                    {
                        name: 'Scientific Discoveries',
                        description: 'Original documents from Einstein, Darwin, and other scientific pioneers.',
                        duration: 'Rotating Exhibit'
                    }
                ],
                cta: 'Plan Your Visit',
                seo: {
                    title: 'Historical Exhibits | Original Manuscripts | Karpeles Museum',
                    description: 'See original historical documents and manuscripts. Free admission to world-class exhibits of American history and rare artifacts.',
                    keywords: 'historical exhibits, original manuscripts, museum exhibits, rare documents'
                }
            },
            visit: {
                title: 'Plan Your Visit',
                headline: 'Everything You Need to Know',
                sections: [
                    {
                        title: 'Admission',
                        content: 'FREE - Always free, no tickets or reservations needed. Donations are welcome but never required.'
                    },
                    {
                        title: 'Hours',
                        content: 'Tuesday through Sunday, 10:00 AM - 4:00 PM. Closed Mondays and major holidays.'
                    },
                    {
                        title: 'What to Expect',
                        content: 'Allow 45-90 minutes for your visit. Exhibits change regularly. Photography allowed (no flash).'
                    },
                    {
                        title: 'Group Tours',
                        content: 'Free guided tours available for groups of 10+. Contact us in advance to schedule.'
                    },
                    {
                        title: 'Accessibility',
                        content: 'All locations are wheelchair accessible. Service animals welcome.'
                    }
                ],
                cta: 'Find Your Nearest Location',
                seo: {
                    title: 'Plan Your Visit | Free Museum Admission | Karpeles',
                    description: 'Plan your free visit to Karpeles Museum. Hours, directions, and what to expect. No admission fee, open to the public.',
                    keywords: 'museum hours, plan museum visit, free admission, museum information'
                }
            }
        };

        return pages[pageType] || pages.homepage;
    }
}

// Analytics Generator
class AnalyticsGenerator {
    simulate(campaigns) {
        const totalImpressions = campaigns.reduce((sum, c) => sum + (c.estimatedImpressions || 0), 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + (c.estimatedClicks || 0), 0);
        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
        const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
        const avgCPC = totalClicks > 0 ? (totalBudget / totalClicks).toFixed(2) : 0;

        return {
            impressions: totalImpressions.toLocaleString(),
            clicks: totalClicks.toLocaleString(),
            ctr: avgCTR + '%',
            cpc: '$' + avgCPC,
            spend: '$' + totalBudget.toLocaleString(),
            conversions: Math.floor(totalClicks * 0.05),
            conversionRate: '5.2%',
            costPerConversion: '$' + (totalBudget / Math.floor(totalClicks * 0.05)).toFixed(2)
        };
    }

    generateOptimizations() {
        return [
            {
                type: 'Keyword Optimization',
                recommendation: 'Add more long-tail keywords related to "free historical museum" and "educational field trips" - these have lower competition and higher intent.',
                impact: 'High',
                effort: 'Low'
            },
            {
                type: 'Ad Copy Testing',
                recommendation: 'Test emphasizing "100% Free Admission" in headlines - this unique value proposition shows 23% higher CTR in similar campaigns.',
                impact: 'High',
                effort: 'Low'
            },
            {
                type: 'Bid Adjustments',
                recommendation: 'Increase bids by 20% on weekends (Saturday-Sunday) when family activity searches peak.',
                impact: 'Medium',
                effort: 'Low'
            },
            {
                type: 'Geographic Targeting',
                recommendation: 'Create location-specific ad groups with local landmarks and neighborhood names for better relevance.',
                impact: 'Medium',
                effort: 'Medium'
            },
            {
                type: 'Audience Targeting',
                recommendation: 'Add remarketing lists for users who visited the website but didn\'t find directions. Show "Visit Today" ads.',
                impact: 'High',
                effort: 'Medium'
            },
            {
                type: 'Ad Extensions',
                recommendation: 'Add location extensions, call extensions, and sitelink extensions highlighting "Free Admission", "Hours", and "Directions".',
                impact: 'High',
                effort: 'Low'
            }
        ];
    }
}

// Initialize Generators
const keywordGen = new KeywordGenerator();
const adCopyGen = new AdCopyGenerator();
const campaignGen = new CampaignGenerator();
const landingPageGen = new LandingPageGenerator();
const analyticsGen = new AnalyticsGenerator();

// UI Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Keywords Tab
    document.getElementById('generate-keywords-btn').addEventListener('click', () => {
        const location = document.getElementById('location-select').value;
        const theme = document.getElementById('theme-select').value;

        const result = keywordGen.generate(location, theme);
        semData.keywords = result.positiveKeywords;

        displayKeywords(result);
    });

    // Ads Tab
    document.getElementById('generate-ads-btn').addEventListener('click', () => {
        const adType = document.getElementById('ad-type-select').value;
        const theme = document.getElementById('ad-theme-select').value;

        const ads = adCopyGen.generate(adType, theme);
        semData.ads = ads;

        displayAds(ads);
    });

    // Campaigns Tab
    document.getElementById('generate-campaigns-btn').addEventListener('click', () => {
        const budget = parseInt(document.getElementById('budget-input').value);
        const goal = document.getElementById('campaign-goal-select').value;

        const campaigns = campaignGen.generate(budget, goal);
        semData.campaigns = campaigns;

        displayCampaigns(campaigns);
    });

    // Landing Page Tab
    document.getElementById('generate-landing-btn').addEventListener('click', () => {
        const pageType = document.getElementById('landing-type-select').value;

        const page = landingPageGen.generate(pageType);
        semData.landingPages.push(page);

        displayLandingPage(page);
    });

    // Analytics Tab
    document.getElementById('simulate-analytics-btn').addEventListener('click', () => {
        if (semData.campaigns.length === 0) {
            alert('Please generate campaigns first!');
            return;
        }

        const analytics = analyticsGen.simulate(semData.campaigns);
        const optimizations = analyticsGen.generateOptimizations();
        semData.analytics = analytics;

        displayAnalytics(analytics, optimizations);
    });

    // Export Functions
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    document.getElementById('export-json-btn').addEventListener('click', exportToJSON);
    document.getElementById('reset-btn').addEventListener('click', resetAll);
});

// Display Functions
function displayKeywords(result) {
    const output = document.getElementById('keywords-output');

    let html = `
        <div class="keyword-group">
            <h3>Positive Keywords (${result.totalCount})</h3>
            <p class="keyword-metrics">Total estimated monthly searches: ${result.positiveKeywords.reduce((sum, k) => sum + k.searchVolume, 0).toLocaleString()}</p>
    `;

    // Group by type
    const byType = {};
    result.positiveKeywords.forEach(kw => {
        if (!byType[kw.type]) byType[kw.type] = [];
        byType[kw.type].push(kw);
    });

    Object.entries(byType).forEach(([type, keywords]) => {
        html += `
            <h4 style="margin-top: 20px; color: #64748b;">${type} (${keywords.length})</h4>
            <div class="keyword-list">
        `;
        keywords.slice(0, 15).forEach(kw => {
            html += `
                <span class="keyword-tag" title="Search Volume: ${kw.searchVolume} | Bid: $${kw.suggestedBid}">
                    ${kw.keyword}
                </span>
            `;
        });
        html += `</div>`;
    });

    html += `</div>`;

    // Negative Keywords
    html += `
        <div class="keyword-group" style="margin-top: 30px;">
            <h3>Negative Keywords (${result.negativeKeywords.length})</h3>
            <p style="color: #64748b; margin-bottom: 15px;">Prevent ads from showing for these searches:</p>
            <div class="keyword-list">
    `;

    result.negativeKeywords.forEach(kw => {
        html += `<span class="keyword-tag" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">${kw}</span>`;
    });

    html += `</div></div>`;

    output.innerHTML = html;
}

function displayAds(ads) {
    const output = document.getElementById('ads-output');

    let html = '<h3 style="margin-bottom: 20px;">Generated Ad Variations</h3>';

    ads.forEach((ad, index) => {
        if (ad.type === 'Responsive Search Ad') {
            html += `
                <div class="ad-card">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                        <strong>Responsive Search Ad</strong> - Google will test combinations
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Headlines (${ad.headlines.length}):</strong>
                        ${ad.headlines.map((h, i) => `<div style="margin: 5px 0;">H${i+1}: ${h}</div>`).join('')}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Descriptions (${ad.descriptions.length}):</strong>
                        ${ad.descriptions.map((d, i) => `<div style="margin: 5px 0;">D${i+1}: ${d}</div>`).join('')}
                    </div>
                    <div class="ad-url">www.karpeles.com/${ad.path1}/${ad.path2}</div>
                </div>
            `;
        } else {
            html += `
                <div class="ad-card">
                    <div class="ad-headline">${ad.headline} | ${ad.headline2}</div>
                    <div class="ad-url">${ad.displayUrl}</div>
                    <div class="ad-description">${ad.description}</div>
                    <div class="ad-meta">
                        <span><strong>CTA:</strong> ${ad.callToAction}</span>
                        <span><strong>Est. CTR:</strong> ${ad.estimatedCTR}</span>
                        <span><strong>Quality Score:</strong> ${ad.qualityScore}/10</span>
                    </div>
                </div>
            `;
        }
    });

    output.innerHTML = html;
}

function displayCampaigns(campaigns) {
    const output = document.getElementById('campaigns-output');

    let html = '<h3 style="margin-bottom: 20px;">Campaign Structure</h3>';

    campaigns.forEach(campaign => {
        html += `
            <div class="campaign-card">
                <div class="campaign-header">
                    <div class="campaign-name">${campaign.name}</div>
                    <div class="campaign-budget">$${campaign.budget}/month</div>
                </div>
                <div class="campaign-details">
                    <div class="detail-item">
                        <div class="detail-label">Campaign Type</div>
                        <div class="detail-value">${campaign.type}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Bid Strategy</div>
                        <div class="detail-value">${campaign.bidStrategy}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Keywords</div>
                        <div class="detail-value">${campaign.keywords}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Est. Impressions</div>
                        <div class="detail-value">${campaign.estimatedImpressions.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Est. Clicks</div>
                        <div class="detail-value">${campaign.estimatedClicks.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Targeting</div>
                        <div class="detail-value">${campaign.targetLocations}</div>
                    </div>
                </div>
                ${campaign.adGroups ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                        <strong>Ad Groups (${campaign.adGroups.length}):</strong>
                        <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                            ${campaign.adGroups.map(ag => `
                                <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    <strong>${ag.name}</strong><br>
                                    <small>${ag.keywords} keywords, ${ag.ads} ads</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    });

    output.innerHTML = html;
}

function displayLandingPage(page) {
    const output = document.getElementById('landing-output');

    let html = `
        <div class="landing-section">
            <h3>${page.title}</h3>
            <div class="landing-content">
                <h1 style="font-size: 2em; margin-bottom: 10px;">${page.headline}</h1>
                ${page.subheadline ? `<h2 style="font-size: 1.3em; color: #64748b; margin-bottom: 20px;">${page.subheadline}</h2>` : ''}
                ${page.heroText ? `<p style="margin-bottom: 20px; font-size: 1.1em;">${page.heroText}</p>` : ''}
                ${page.cta ? `<div class="cta-preview">${page.cta}</div>` : ''}
            </div>
        </div>
    `;

    if (page.sections) {
        page.sections.forEach(section => {
            html += `
                <div class="landing-section">
                    <h3>${section.title}</h3>
                    <div class="landing-content">
                        <p>${section.content}</p>
                    </div>
                </div>
            `;
        });
    }

    if (page.locations) {
        html += `
            <div class="landing-section">
                <h3>Our Locations</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
        `;
        page.locations.forEach(loc => {
            html += `
                <div class="landing-content">
                    <h4 style="color: var(--primary-color); margin-bottom: 10px;">${loc.name}</h4>
                    <p><strong>Hours:</strong> ${loc.hours}</p>
                    <p><strong>Admission:</strong> <span style="color: var(--success-color); font-weight: bold;">${loc.admission}</span></p>
                    <ul style="margin-top: 10px; margin-left: 20px;">
                        ${loc.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        html += `</div></div>`;
    }

    if (page.exhibits) {
        html += `<div class="landing-section"><h3>Featured Exhibits</h3>`;
        page.exhibits.forEach(exhibit => {
            html += `
                <div class="landing-content" style="margin-bottom: 15px;">
                    <h4 style="color: var(--primary-color);">${exhibit.name}</h4>
                    <p>${exhibit.description}</p>
                    <p><small style="color: var(--text-secondary);"><strong>Duration:</strong> ${exhibit.duration}</small></p>
                </div>
            `;
        });
        html += `</div>`;
    }

    // SEO Section
    if (page.seo) {
        html += `
            <div class="landing-section">
                <h3>SEO Optimization</h3>
                <div class="landing-content">
                    <p><strong>Page Title:</strong> ${page.seo.title}</p>
                    <p><strong>Meta Description:</strong> ${page.seo.description}</p>
                    <p><strong>Keywords:</strong> ${page.seo.keywords}</p>
                </div>
            </div>
        `;
    }

    output.innerHTML = html;
}

function displayAnalytics(analytics, optimizations) {
    // Update stat cards
    document.getElementById('stat-impressions').textContent = analytics.impressions;
    document.getElementById('stat-clicks').textContent = analytics.clicks;
    document.getElementById('stat-ctr').textContent = analytics.ctr;
    document.getElementById('stat-cpc').textContent = analytics.cpc;

    const output = document.getElementById('analytics-output');

    let html = `
        <div class="landing-section">
            <h3>Campaign Performance Summary</h3>
            <div class="landing-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div><strong>Total Spend:</strong> ${analytics.spend}</div>
                    <div><strong>Conversions:</strong> ${analytics.conversions}</div>
                    <div><strong>Conversion Rate:</strong> ${analytics.conversionRate}</div>
                    <div><strong>Cost/Conversion:</strong> ${analytics.costPerConversion}</div>
                </div>
            </div>
        </div>

        <div class="landing-section">
            <h3>Optimization Recommendations</h3>
    `;

    optimizations.forEach(opt => {
        const impactColor = opt.impact === 'High' ? 'var(--success-color)' :
                           opt.impact === 'Medium' ? 'var(--warning-color)' :
                           'var(--secondary-color)';

        html += `
            <div class="optimization-tip">
                <strong style="color: ${impactColor};">⭐ ${opt.type} (${opt.impact} Impact, ${opt.effort} Effort)</strong>
                <p style="margin-top: 8px;">${opt.recommendation}</p>
            </div>
        `;
    });

    html += `</div>`;

    output.innerHTML = html;
}

// Export Functions
function exportToCSV() {
    if (semData.keywords.length === 0) {
        alert('Please generate some data first!');
        return;
    }

    let csv = 'Type,Keyword,Match Type,Search Volume,Competition,Suggested Bid,Location,Theme\n';

    semData.keywords.forEach(kw => {
        csv += `Positive,"${kw.keyword}",${kw.type},${kw.searchVolume},${kw.competition},${kw.suggestedBid},${kw.location || ''},${kw.theme || ''}\n`;
    });

    downloadFile(csv, 'karpeles-sem-keywords.csv', 'text/csv');
}

function exportToJSON() {
    const dataToExport = {
        generated: new Date().toISOString(),
        museum: 'Karpeles Manuscript Library Museums',
        data: semData
    };

    const json = JSON.stringify(dataToExport, null, 2);
    downloadFile(json, 'karpeles-sem-data.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function resetAll() {
    if (confirm('Are you sure you want to reset all data?')) {
        semData.keywords = [];
        semData.ads = [];
        semData.campaigns = [];
        semData.landingPages = [];
        semData.analytics = {};

        document.querySelectorAll('.output-panel').forEach(panel => {
            panel.innerHTML = '';
        });

        document.getElementById('stat-impressions').textContent = '--';
        document.getElementById('stat-clicks').textContent = '--';
        document.getElementById('stat-ctr').textContent = '--';
        document.getElementById('stat-cpc').textContent = '--';

        alert('All data has been reset!');
    }
}
