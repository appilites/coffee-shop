# New Arrivals Integration Guide

## Overview
This guide explains how to integrate the New Arrivals system from your admin dashboard into your coffee shop website.

## API Endpoint
Your New Arrivals data is available via the public API:
```
GET /api/public/new-arrivals
```

## API Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "arrival-1776072814.026566-2e5d95da",
      "title": "Protein Waffles",
      "description": "Build your own protein-packed waffle with your favorite toppings",
      "imageUrl": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop&crop=center",
      "buttonText": "Try Now",
      "redirectLink": "/menu?category=waffles",
      "displayOrder": 1
    }
  ],
  "count": 7
}
```

## Frontend Integration

### 1. React/Next.js Component Example
```jsx
import { useState, useEffect } from 'react'

const NewArrivals = () => {
  const [arrivals, setArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      const response = await fetch('/api/public/new-arrivals')
      const data = await response.json()
      if (data.success) {
        setArrivals(data.data)
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading new arrivals...</div>
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arrivals.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <a
                  href={item.redirectLink}
                  className="inline-block bg-coffee-brown text-white px-6 py-2 rounded-lg hover:bg-coffee-dark transition-colors"
                >
                  {item.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewArrivals
```

### 2. Vanilla JavaScript Example
```html
<!DOCTYPE html>
<html>
<head>
    <title>New Arrivals</title>
    <style>
        .arrivals-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .arrival-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .arrival-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .arrival-content {
            padding: 20px;
        }
        .arrival-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .arrival-description {
            color: #666;
            margin-bottom: 15px;
        }
        .arrival-button {
            background: #8B4513;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            cursor: pointer;
        }
        .arrival-button:hover {
            background: #654321;
        }
    </style>
</head>
<body>
    <div id="new-arrivals">
        <h2>New Arrivals</h2>
        <div id="arrivals-container" class="arrivals-container">
            <!-- Content will be loaded here -->
        </div>
    </div>

    <script>
        async function loadNewArrivals() {
            try {
                const response = await fetch('/api/public/new-arrivals')
                const data = await response.json()
                if (data.success) {
                    renderArrivals(data.data)
                }
            } catch (error) {
                console.error('Error loading new arrivals:', error)
                document.getElementById('arrivals-container').innerHTML = 
                    '<p>Unable to load new arrivals at this time.</p>'
            }
        }

        function renderArrivals(arrivals) {
            const container = document.getElementById('arrivals-container')
            container.innerHTML = arrivals.map(item => `
                <div class="arrival-card">
                    <img src="${item.imageUrl}" alt="${item.title}" class="arrival-image">
                    <div class="arrival-content">
                        <h3 class="arrival-title">${item.title}</h3>
                        <p class="arrival-description">${item.description}</p>
                        <a href="${item.redirectLink}" class="arrival-button">${item.buttonText}</a>
                    </div>
                </div>
            `).join('')
        }

        // Load arrivals when page loads
        document.addEventListener('DOMContentLoaded', loadNewArrivals)
    </script>
</body>
</html>
```

### 3. WordPress Integration
```php
<?php
// Add to your theme's functions.php
function get_new_arrivals() {
    $response = wp_remote_get(home_url('/api/public/new-arrivals'));
    
    if (is_wp_error($response)) {
        return [];
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    return $data['success'] ? $data['data'] : [];
}

// Shortcode for displaying new arrivals
function new_arrivals_shortcode($atts) {
    $arrivals = get_new_arrivals();
    
    if (empty($arrivals)) {
        return '<p>No new arrivals available.</p>';
    }

    ob_start();
    ?>
    <div class="new-arrivals-section">
        <h2>New Arrivals</h2>
        <div class="arrivals-grid">
            <?php foreach ($arrivals as $item): ?>
                <div class="arrival-card">
                    <img src="<?php echo esc_url($item['imageUrl']); ?>" alt="<?php echo esc_attr($item['title']); ?>">
                    <div class="arrival-content">
                        <h3><?php echo esc_html($item['title']); ?></h3>
                        <p><?php echo esc_html($item['description']); ?></p>
                        <a href="<?php echo esc_url($item['redirectLink']); ?>" class="arrival-button">
                            <?php echo esc_html($item['buttonText']); ?>
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <style>
        .arrivals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .arrival-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .arrival-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .arrival-content {
            padding: 20px;
        }
        .arrival-button {
            background: #8B4513;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
        }
    </style>
    <?php
    return ob_get_clean();
}
add_shortcode('new_arrivals', 'new_arrivals_shortcode');
?>
```

## CSS Styling Examples

### Modern Card Design
```css
.new-arrivals {
    padding: 60px 0;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.arrivals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.arrival-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.arrival-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.arrival-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
}

.arrival-content {
    padding: 25px;
}

.arrival-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 12px;
}

.arrival-description {
    color: #7f8c8d;
    line-height: 1.6;
    margin-bottom: 20px;
}

.arrival-button {
    background: linear-gradient(45deg, #8B4513, #A0522D);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-block;
}

.arrival-button:hover {
    background: linear-gradient(45deg, #654321, #8B4513);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}
```

### Coffee Shop Theme
```css
.coffee-arrivals {
    background: #f8f5f0;
    padding: 50px 0;
    font-family: 'Georgia', serif;
}

.coffee-arrivals h2 {
    text-align: center;
    font-size: 2.5rem;
    color: #3c2415;
    margin-bottom: 40px;
    position: relative;
}

.coffee-arrivals h2::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: #8B4513;
}

.coffee-card {
    background: white;
    border: 2px solid #e8ddd4;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.coffee-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #8B4513, #D2691E, #8B4513);
}

.coffee-button {
    background: #8B4513;
    color: #f8f5f0;
    border: 2px solid #654321;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: 'Georgia', serif;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
}

.coffee-button:hover {
    background: #654321;
    border-color: #8B4513;
    color: white;
}
```

## Error Handling
```javascript
async function fetchNewArrivalsWithRetry(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch('/api/public/new-arrivals')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (data.success) {
                return data.data
            } else {
                throw new Error('API returned unsuccessful response')
            }
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed:`, error)
            if (i === maxRetries - 1) {
                // Last attempt failed, show fallback
                return []
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
}
```

## Caching Strategy
```javascript
class NewArrivalsCache {
    constructor(cacheTime = 5 * 60 * 1000) { // 5 minutes
        this.cacheTime = cacheTime
        this.cache = null
        this.lastFetch = 0
    }

    async getArrivals() {
        const now = Date.now()
        if (this.cache && (now - this.lastFetch) < this.cacheTime) {
            return this.cache
        }

        try {
            const response = await fetch('/api/public/new-arrivals')
            const data = await response.json()
            if (data.success) {
                this.cache = data.data
                this.lastFetch = now
                return this.cache
            }
        } catch (error) {
            console.error('Failed to fetch new arrivals:', error)
            // Return cached data if available
            return this.cache || []
        }
        return []
    }
}

// Usage
const arrivalsCache = new NewArrivalsCache()
const arrivals = await arrivalsCache.getArrivals()
```

## Mobile Responsive Design
```css
@media (max-width: 768px) {
    .arrivals-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 0 15px;
    }

    .arrival-card {
        margin-bottom: 20px;
    }

    .arrival-content {
        padding: 20px 15px;
    }

    .arrival-title {
        font-size: 1.2rem;
    }

    .arrival-description {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .new-arrivals {
        padding: 30px 0;
    }

    .arrival-image {
        height: 180px;
    }

    .arrival-button {
        width: 100%;
        text-align: center;
        padding: 12px;
    }
}
```

## Integration Checklist
- [ ] API endpoint is accessible from your domain
- [ ] CORS is configured if needed
- [ ] Error handling is implemented
- [ ] Loading states are shown to users
- [ ] Responsive design works on all devices
- [ ] Images load properly and have alt text
- [ ] Links work correctly
- [ ] Caching is implemented for performance
- [ ] Fallback content is available if API fails

## Dashboard Management
Remember that you can manage all New Arrivals content through your admin dashboard at:
- **Main Dashboard**: `/admin-new-arrivals`
- **Add New**: Click "Add New Arrival" button
- **Edit Existing**: Click edit button on any item

Any changes made in the dashboard will automatically be reflected in your coffee shop website through the API.

## Support
If you need help with integration or encounter any issues, check:
1. API endpoint is responding correctly
2. Network connectivity between shop and admin dashboard
3. CORS settings if cross-domain
4. Console errors in browser developer tools