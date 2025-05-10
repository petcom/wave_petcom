(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SonarCalendar = {}));
  })(this, (function (exports) { 'use strict';
  
    /**
     * EventCard Component
     * 
     * Displays a single event in the calendar
     */
  
    class EventCard {
      /**
       * Create a new EventCard instance
       * @param {Object} event - The event data
       * @param {string} [theme='light'] - The theme to use ('light' or 'dark')
       * @param {Function} [onClick] - Callback function when the card is clicked
       */
      constructor(event, theme = 'light', onClick) {
        this.event = event;
        this.theme = theme;
        this.onClick = onClick;
        this.element = this.createElement();
      }
  
      /**
       * Create the event card element
       * @returns {HTMLElement} The created element
       * @private
       */
      createElement() {
        const { id, title, start, end, description, category } = this.event;
        const startTime = this.formatTime(start);
        const endTime = this.formatTime(end);
        const categoryClass = category ? `event-category-${category.toLowerCase().replace(/\s+/g, '-')}` : '';
  
        const card = document.createElement('div');
        card.className = `event-card ${categoryClass} theme-${this.theme}`;
        card.dataset.eventId = id;
        
        // Add ARIA attributes for accessibility
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View details for ${title}`);
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${title}`);
        
        card.innerHTML = `
        <div class="event-card__header">
          <h3 class="event-card__title">${title}</h3>
          ${category ? `<span class="event-card__category">${category}</span>` : ''}
        </div>
        <div class="event-card__time">
          <time datetime="${start}">${startTime}</time> - <time datetime="${end}">${endTime}</time>
        </div>
        ${description ? `<p class="event-card__description">${description}</p>` : ''}
        <div class="event-card__more">View details</div>
      `;
        
        // Add click and keyboard event listeners
        if (this.onClick) {
          const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onClick(this.event);
          };
          
          card.addEventListener('click', handleClick);
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e);
            }
          });
        }
  
        return card;
      }
  
      /**
       * Format a date string to a time string
       * @param {string} dateString - The date string to format
       * @returns {string} The formatted time string
       * @private
       */
      formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
  
      /**
       * Render the event card
       * @param {HTMLElement} container - The container to render the card into
       */
      render(container) {
        container.appendChild(this.element);
      }
  
      /**
       * Update the event data
       * @param {Object} newEvent - The new event data
       */
      update(newEvent) {
        this.event = { ...this.event, ...newEvent };
        const newElement = this.createElement();
        this.element.parentNode.replaceChild(newElement, this.element);
        this.element = newElement;
      }
    }
  
    /**
     * EventDetails Component
     * 
     * Displays detailed information about a calendar event
     */
  
    class EventDetails {
      /**
       * Create a new EventDetails instance
       * @param {Object} event - The event data
       * @param {Function} onClose - Callback when the details view is closed
       * @param {string} [theme='light'] - The theme to use ('light' or 'dark')
       */
      constructor(event, onClose, theme = 'light') {
        this.event = event;
        this.onClose = onClose;
        this.theme = theme;
        this.element = this.createElement();
      }
  
      /**
       * Create the event details element
       * @returns {HTMLElement} The created element
       * @private
       */
      createElement() {
        const { id, title, start, end, description, category, location } = this.event;
        const startDate = this.formatDate(start);
        const startTime = this.formatTime(start);
        const endTime = this.formatTime(end);
        const duration = this.calculateDuration(start, end);
  
        const details = document.createElement('div');
        details.className = `event-details theme-${this.theme}`;
        details.dataset.eventId = id;
        
        details.innerHTML = `
        <div class="event-details__overlay"></div>
        <div class="event-details__content">
          <button class="event-details__close" aria-label="Close details">
            <span aria-hidden="true">&times;</span>
          </button>
          
          <div class="event-details__header">
            ${category ? `<span class="event-details__category">${category}</span>` : ''}
            <h2 class="event-details__title">${title}</h2>
          </div>
          
          <div class="event-details__info">
            <div class="event-details__info-item">
              <span class="event-details__info-label">Date:</span>
              <time datetime="${start}">${startDate}</time>
            </div>
            <div class="event-details__info-item">
              <span class="event-details__info-label">Time:</span>
              <time datetime="${start}">${startTime}</time> - <time datetime="${end}">${endTime}</time>
              <span class="event-details__duration">(${duration})</span>
            </div>
            ${location ? `
              <div class="event-details__info-item">
                <span class="event-details__info-label">Location:</span>
                <span>${location}</span>
              </div>
            ` : ''}
          </div>
          
          ${description ? `
            <div class="event-details__description">
              <h3>Description</h3>
              <p>${description}</p>
            </div>
          ` : ''}
          
          <div class="event-details__actions">
            <button class="btn btn--secondary">Edit</button>
            <button class="btn btn--primary">Add to Calendar</button>
          </div>
        </div>
      `;
  
        // Add event listeners
        details.querySelector('.event-details__overlay').addEventListener('click', () => this.close());
        details.querySelector('.event-details__close').addEventListener('click', () => this.close());
  
        return details;
      }
  
      /**
       * Format a date string to a readable date
       * @param {string} dateString - The date string to format
       * @returns {string} The formatted date string
       * @private
       */
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
  
      /**
       * Format a date string to a time string
       * @param {string} dateString - The date string to format
       * @returns {string} The formatted time string
       * @private
       */
      formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
  
      /**
       * Calculate the duration between two dates
       * @param {string} start - The start date string
       * @param {string} end - The end date string
       * @returns {string} The formatted duration
       * @private
       */
      calculateDuration(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
  
      /**
       * Close the details view
       */
      close() {
        this.element.classList.add('event-details--closing');
        setTimeout(() => {
          this.element.remove();
          if (this.onClose) this.onClose();
        }, 300); // Match the CSS transition duration
      }
  
      /**
       * Render the event details
       * @param {HTMLElement} container - The container to render into
       */
      render(container) {
        container.appendChild(this.element);
        // Trigger the opening animation
        requestAnimationFrame(() => {
          this.element.classList.add('event-details--visible');
        });
      }
    }
  
    /**
     * ViewToggle component for switching between different calendar views
     */
  
    class ViewToggle {
      /**
       * Create a new ViewToggle instance
       * @param {Object} options - Configuration options
       * @param {string} [options.initialView='upcoming'] - Initial active view
       * @param {Function} [options.onChange] - Callback when view changes
       * @param {string} [options.theme='light'] - Theme ('light' or 'dark')
       */
      constructor({ initialView = 'upcoming', onChange, theme = 'light' } = {}) {
        this.views = ['upcoming', 'month', 'week', 'day'];
        this.activeView = initialView;
        this.onChange = onChange;
        this.theme = theme;
        this.element = this.createElement();
      }
  
      /**
       * Create the view toggle element
       * @returns {HTMLElement} The created element
       * @private
       */
      createElement() {
        const container = document.createElement('div');
        container.className = `view-toggle theme-${this.theme}`;
        container.setAttribute('role', 'tablist');
        container.setAttribute('aria-label', 'Calendar view');
  
        this.views.forEach(view => {
          const button = document.createElement('button');
          button.className = `view-toggle__button ${view === this.activeView ? 'is-active' : ''}`;
          button.textContent = this.formatViewName(view);
          button.dataset.view = view;
          button.setAttribute('role', 'tab');
          button.setAttribute('aria-selected', view === this.activeView ? 'true' : 'false');
          button.setAttribute('aria-controls', 'calendar-view');
          
          button.addEventListener('click', () => this.setActiveView(view));
          
          container.appendChild(button);
        });
  
        return container;
      }
  
      /**
       * Format view name for display
       * @param {string} view - View name
       * @returns {string} Formatted view name
       * @private
       */
      formatViewName(view) {
        return view.charAt(0).toUpperCase() + view.slice(1);
      }
  
      /**
       * Set the active view
       * @param {string} view - View to activate
       */
      setActiveView(view) {
        if (!this.views.includes(view) || view === this.activeView) return;
  
        // Update active state
        this.element.querySelectorAll('.view-toggle__button').forEach(button => {
          const isActive = button.dataset.view === view;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
  
        this.activeView = view;
  
        // Trigger change callback
        if (this.onChange) {
          this.onChange(view);
        }
      }
  
  
      /**
       * Update the theme
       * @param {string} theme - New theme ('light' or 'dark')
       */
      setTheme(theme) {
        this.theme = theme;
        this.element.classList.toggle('theme-dark', theme === 'dark');
        this.element.classList.toggle('theme-light', theme === 'light');
      }
  
      /**
       * Render the view toggle in a container
       * @param {HTMLElement} container - Container to render in
       */
      render(container) {
        container.appendChild(this.element);
      }
    }
  
    /**
     * DatePicker component for calendar date selection
     */
  
    class DatePicker {
      /**
       * Create a new DatePicker instance
       * @param {Object} options - Configuration options
       * @param {Date} [options.initialDate=new Date()] - Initial selected date
       * @param {Function} [options.onChange] - Callback when date changes
       * @param {string} [options.theme='light'] - Theme ('light' or 'dark')
       */
      constructor({ initialDate = new Date(), onChange, theme = 'light' } = {}) {
        this.selectedDate = new Date(initialDate);
        this.onChange = onChange;
        this.theme = theme;
        this.months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.element = this.createElement();
      }
  
      /**
       * Create the date picker element
       * @returns {HTMLElement} The created element
       * @private
       */
      createElement() {
        const container = document.createElement('div');
        container.className = `date-picker theme-${this.theme}`;
        
        // Navigation controls
        const nav = document.createElement('div');
        nav.className = 'date-picker__nav';
        
        const prevButton = document.createElement('button');
        prevButton.className = 'date-picker__nav-button';
        prevButton.innerHTML = '&larr;';
        prevButton.setAttribute('aria-label', 'Previous month');
        prevButton.addEventListener('click', () => this.navigate(-1));
        
        const nextButton = document.createElement('button');
        nextButton.className = 'date-picker__nav-button';
        nextButton.innerHTML = '&rarr;';
        nextButton.setAttribute('aria-label', 'Next month');
        nextButton.addEventListener('click', () => this.navigate(1));
        
        this.monthYearDisplay = document.createElement('span');
        this.monthYearDisplay.className = 'date-picker__month-year';
        this.updateMonthYearDisplay();
        
        nav.appendChild(prevButton);
        nav.appendChild(this.monthYearDisplay);
        nav.appendChild(nextButton);
        
        // Calendar grid
        this.calendarGrid = document.createElement('div');
        this.calendarGrid.className = 'date-picker__grid';
        this.calendarGrid.setAttribute('role', 'grid');
        this.calendarGrid.setAttribute('aria-label', 'Calendar');
        
        // Day headers
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const dayHeaders = document.createElement('div');
        dayHeaders.className = 'date-picker__day-headers';
        dayNames.forEach(day => {
          const dayHeader = document.createElement('div');
          dayHeader.className = 'date-picker__day-header';
          dayHeader.textContent = day;
          dayHeader.setAttribute('aria-label', day);
          dayHeaders.appendChild(dayHeader);
        });
        
        this.daysContainer = document.createElement('div');
        this.daysContainer.className = 'date-picker__days';
        this.renderDays();
        
        this.calendarGrid.appendChild(dayHeaders);
        this.calendarGrid.appendChild(this.daysContainer);
        
        container.appendChild(nav);
        container.appendChild(this.calendarGrid);
        
        return container;
      }
  
      /**
       * Update the month and year display
       * @private
       */
      updateMonthYearDisplay() {
        const month = this.months[this.selectedDate.getMonth()];
        const year = this.selectedDate.getFullYear();
        this.monthYearDisplay.textContent = `${month} ${year}`;
        this.monthYearDisplay.setAttribute('aria-live', 'polite');
      }
  
      /**
       * Render the calendar days
       * @private
       */
      renderDays() {
        this.daysContainer.innerHTML = '';
        
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        
        // Get first day of month and total days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Create day elements
        for (let i = 0; i < 42; i++) { // 6 rows x 7 days
          const day = i - firstDay + 1;
          const dayElement = document.createElement('button');
          dayElement.className = 'date-picker__day';
          dayElement.setAttribute('role', 'gridcell');
          
          if (day > 0 && day <= daysInMonth) {
            dayElement.textContent = day;
            dayElement.dataset.day = day;
            dayElement.setAttribute('aria-label', new Date(year, month, day).toLocaleDateString());
            
            // Highlight current day
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
              dayElement.classList.add('is-today');
            }
            
            // Highlight selected day
            if (day === this.selectedDate.getDate()) {
              dayElement.classList.add('is-selected');
              dayElement.setAttribute('aria-selected', 'true');
            } else {
              dayElement.setAttribute('aria-selected', 'false');
            }
            
            dayElement.addEventListener('click', () => this.selectDay(day));
          } else {
            dayElement.classList.add('is-empty');
            dayElement.setAttribute('aria-hidden', 'true');
          }
          
          this.daysContainer.appendChild(dayElement);
        }
      }
  
      /**
       * Navigate to previous or next month
       * @param {number} direction - -1 for previous month, 1 for next month
       * @private
       */
      navigate(direction) {
        this.selectedDate.setMonth(this.selectedDate.getMonth() + direction);
        this.updateMonthYearDisplay();
        this.renderDays();
      }
  
      /**
       * Select a day
       * @param {number} day - The day to select
       * @private
       */
      selectDay(day) {
        const newDate = new Date(this.selectedDate);
        newDate.setDate(day);
        this.selectedDate = newDate;
        this.renderDays();
        
        if (this.onChange) {
          this.onChange(newDate);
        }
      }
  
      /**
       * Set the selected date
       * @param {Date} date - The date to select
       */
      setDate(date) {
        this.selectedDate = new Date(date);
        this.updateMonthYearDisplay();
        this.renderDays();
      }
  
      /**
       * Set the theme
       * @param {string} theme - The theme to set ('light' or 'dark')
       */
      setTheme(theme) {
        this.theme = theme;
        this.element.className = `date-picker theme-${theme}`;
      }
  
      /**
       * Get the current selected date
       * @returns {Date} The selected date
       */
      getDate() {
        return new Date(this.selectedDate);
      }
    }
  
    /**
     * API Service for Sonar Calendar
     * Handles all API interactions with the calendar backend
     */
  
    class ApiService {
      /**
       * Create a new ApiService instance
       * @param {string} baseUrl - Base URL for the API
       */
      constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
      }
  
      /**
       * Make a request to the API
       * @private
       */
      async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const cacheKey = `${options.method || 'GET'}:${url}`;
        const now = Date.now();
  
        // Check cache first
        if (options.method === 'GET' && this.cache.has(cacheKey)) {
          const { data, timestamp } = this.cache.get(cacheKey);
          if (now - timestamp < this.cacheExpiry) {
            return data;
          }
          this.cache.delete(cacheKey);
        }
  
        try {
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
            ...options,
          });
  
          if (!response.ok) {
            const error = new Error(`API request failed: ${response.statusText}`);
            error.status = response.status;
            throw error;
          }
  
          const data = await response.json();
  
          // Cache GET requests
          if (options.method === 'GET') {
            this.cache.set(cacheKey, { data, timestamp: now });
          }
  
          return data;
        } catch (error) {
          console.error('API request failed:', error);
          throw error;
        }
      }
  
      // Events
  
      /**
       * Fetch all events
       * @param {Object} [params] - Query parameters
       * @returns {Promise<Array>} - Array of events
       */
      async getEvents(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._request(`/api/events${query ? `?${query}` : ''}`);
      }
  
      /**
       * Fetch a single event by ID
       * @param {string} id - Event ID
       * @returns {Promise<Object>} - Event data
       */
      async getEvent(id) {
        return this._request(`/api/events/${id}`);
      }
  
      /**
       * Create a new event
       * @param {Object} eventData - Event data
       * @returns {Promise<Object>} - Created event data
       */
      async createEvent(eventData) {
        return this._request('/api/events', {
          method: 'POST',
          body: JSON.stringify(eventData),
        });
      }
  
      /**
       * Update an existing event
       * @param {string} id - Event ID
       * @param {Object} updates - Fields to update
       * @returns {Promise<Object>} - Updated event data
       */
      async updateEvent(id, updates) {
        return this._request(`/api/events/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      }
  
      /**
       * Delete an event
       * @param {string} id - Event ID
       * @returns {Promise<Object>} - Confirmation
       */
      async deleteEvent(id) {
        return this._request(`/api/events/${id}`, {
          method: 'DELETE',
        });
      }
  
      // Categories
  
      /**
       * Fetch all categories
       * @returns {Promise<Array>} - Array of categories
       */
      async getCategories() {
        return this._request('/api/categories');
      }
  
      /**
       * Create a new category
       * @param {Object} categoryData - Category data
       * @returns {Promise<Object>} - Created category data
       */
      async createCategory(categoryData) {
        return this._request('/api/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData),
        });
      }
  
      // Search
  
      /**
       * Search events
       * @param {string} query - Search query
       * @param {Object} [params] - Additional search parameters
       * @returns {Promise<Array>} - Matching events
       */
      async searchEvents(query, params = {}) {
        return this._request(`/api/search?q=${encodeURIComponent(query)}&${new URLSearchParams(params)}`);
      }
    }
  
    // Determine the base URL based on the environment
    const getApiBaseUrl = () => {
      // In browser, we can use a data attribute, window variable, or relative path
      if (typeof window !== 'undefined') {
        // Check for a data attribute on the script tag
        const scriptTag = document.currentScript || 
          Array.from(document.getElementsByTagName('script')).find(script => 
            script.src && script.src.includes('sonar-calendar')
          );
        
        if (scriptTag && scriptTag.dataset.apiBaseUrl) {
          return scriptTag.dataset.apiBaseUrl;
        }
        
        // Check for a global variable
        if (window.SONAR_CALENDAR_CONFIG && window.SONAR_CALENDAR_CONFIG.apiBaseUrl) {
          return window.SONAR_CALENDAR_CONFIG.apiBaseUrl;
        }
        
        // Default to relative path
        return '/api';
      }
      
      // In Node.js environment
      return process.env.API_BASE_URL || '';
    };
  
    // Export a singleton instance
    const apiService = new ApiService(getApiBaseUrl());
  
    /**
     * Event Service for Sonar Calendar
     * Handles event-related operations and caching
     */
  
    class EventService {
      constructor() {
        this.eventsCache = new Map();
        this.categoriesCache = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
        this.lastFetchTime = 0;
      }
  
      /**
       * Get all events with optional filtering
       * @param {Object} [filters] - Filter criteria
       * @returns {Promise<Array>} - Array of events
       */
      async getEvents(filters = {}) {
        try {
          const cacheKey = this._generateCacheKey('events', filters);
          const now = Date.now();
  
          // Return cached data if available and not expired
          if (this.eventsCache.has(cacheKey)) {
            const { data, timestamp } = this.eventsCache.get(cacheKey);
            if (now - timestamp < this.cacheExpiry) {
              return data;
            }
          }
  
          // Fetch from API
          const events = await apiService.getEvents(filters);
          
          // Update cache
          this.eventsCache.set(cacheKey, {
            data: events,
            timestamp: now
          });
  
          return events;
        } catch (error) {
          console.error('Failed to fetch events:', error);
          throw error;
        }
      }
  
  
      /**
       * Get a single event by ID
       * @param {string} id - Event ID
       * @returns {Promise<Object>} - Event data
       */
      async getEvent(id) {
        try {
          // Check cache first
          for (const { data } of this.eventsCache.values()) {
            const cachedEvent = Array.isArray(data) 
              ? data.find(event => event.id === id)
              : null;
            if (cachedEvent) return cachedEvent;
          }
  
          // If not in cache, fetch from API
          return await apiService.getEvent(id);
        } catch (error) {
          console.error(`Failed to fetch event ${id}:`, error);
          throw error;
        }
      }
  
      /**
       * Create a new event
       * @param {Object} eventData - Event data
       * @returns {Promise<Object>} - Created event
       */
      async createEvent(eventData) {
        try {
          const newEvent = await apiService.createEvent(eventData);
          this._invalidateCache();
          return newEvent;
        } catch (error) {
          console.error('Failed to create event:', error);
          throw error;
        }
      }
  
      /**
       * Update an existing event
       * @param {string} id - Event ID
       * @param {Object} updates - Fields to update
       * @returns {Promise<Object>} - Updated event
       */
      async updateEvent(id, updates) {
        try {
          const updatedEvent = await apiService.updateEvent(id, updates);
          this._invalidateCache();
          return updatedEvent;
        } catch (error) {
          console.error(`Failed to update event ${id}:`, error);
          throw error;
        }
      }
  
      /**
       * Delete an event
       * @param {string} id - Event ID
       * @returns {Promise<void>}
       */
      async deleteEvent(id) {
        try {
          await apiService.deleteEvent(id);
          this._invalidateCache();
        } catch (error) {
          console.error(`Failed to delete event ${id}:`, error);
          throw error;
        }
      }
  
      /**
       * Get all categories
       * @returns {Promise<Array>} - Array of categories
       */
      async getCategories() {
        try {
          const now = Date.now();
          
          // Return cached categories if available and not expired
          if (this.categoriesCache && now - this.lastFetchTime < this.cacheExpiry) {
            return this.categoriesCache;
          }
  
          // Fetch from API
          const categories = await apiService.getCategories();
          
          // Update cache
          this.categoriesCache = categories;
          this.lastFetchTime = now;
          
          return categories;
        } catch (error) {
          console.error('Failed to fetch categories:', error);
          throw error;
        }
      }
  
      /**
       * Search events
       * @param {string} query - Search query
       * @param {Object} [options] - Search options
       * @returns {Promise<Array>} - Matching events
       */
      async searchEvents(query, options = {}) {
        try {
          return await apiService.searchEvents(query, options);
        } catch (error) {
          console.error('Search failed:', error);
          throw error;
        }
      }
  
      /**
       * Invalidate all cached data
       */
      _invalidateCache() {
        this.eventsCache.clear();
        this.categoriesCache = null;
      }
  
      /**
       * Generate a cache key from filter criteria
       * @private
       */
      _generateCacheKey(prefix, filters) {
        return `${prefix}:${JSON.stringify(filters)}`;
      }
    }
  
    // Export a singleton instance
    const eventService = new EventService();
  
    /**
     * Error handling utility for API responses
     */
  
    class ApiError extends Error {
      /**
       * Create a new API error
       * @param {string} message - Error message
       * @param {number} [status] - HTTP status code
       * @param {Object} [details] - Additional error details
       */
      constructor(message, status = 500, details = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
      }
    }
  
    /**
     * Handle API errors consistently
     * @param {Error} error - The error to handle
     * @param {string} [context] - Additional context for the error
     * @throws {ApiError}
     */
    function handleApiError(error, context = '') {
      if (error instanceof ApiError) {
        // Re-throw our custom errors
        throw error;
      }
  
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error: Unable to connect to the server',
          0,
          { originalError: error.message, context }
        );
      }
  
      // Handle HTTP errors
      if (error.status) {
        const message = error.message || 'An unknown error occurred';
        throw new ApiError(
          message,
          error.status,
          { originalError: error, context }
        );
      }
  
      // Handle other errors
      throw new ApiError(
        error.message || 'An unexpected error occurred',
        error.status || 500,
        { originalError: error, context }
      );
    }
  
    /**
     * Sonar Calendar - Main Calendar Component
     * 
     * This is the main calendar component that handles the overall calendar state,
     * view management, and API interactions.
     */
  
    class SonarCalendar {
      /**
       * Create a new SonarCalendar instance
       * @param {Object} options - Configuration options
       * @param {HTMLElement} options.container - The container element for the calendar
       * @param {string} [options.theme='light'] - The theme to use ('light' or 'dark')
       * @param {string} [options.apiUrl] - Base URL for the events API
       * @param {string} [options.dataSelector] - CSS selector for an element containing JSON data
       */
      constructor({ container, theme = 'light', apiUrl, dataSelector } = {}) {
        if (!container) {
          throw new Error('Container element is required');
        }
  
        this.container = container;
        this.theme = theme;
        this.apiUrl = apiUrl;
        this.dataSelector = dataSelector;
        this.currentDate = new Date();
        this.events = [];
        this.isLoading = false;
        this.error = null;
        this.activeEvent = null;
        this.activeEventDetails = null;
        this.currentView = 'upcoming'; // 'upcoming', 'month', 'week', 'day'
  
        // Bind methods
        this.handleEventClick = this.handleEventClick.bind(this);
        this.closeEventDetails = this.closeEventDetails.bind(this);
        this.handlePopState = this.handlePopState.bind(this);
  
        // Initialize the calendar
        this.initialize();
        
        // Set up handlers
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
      }
  
  
      /**
       * Initialize the calendar
       * @private
       */
      initialize() {
        // Apply theme
        this.setTheme(this.theme);
        
        // Set up the container
        this.container.innerHTML = `
        <div class="sonar-calendar">
          <div class="calendar-header">
            <h2>Sonar Calendar</h2>
            <div class="calendar-controls">
              <button class="btn btn-icon" id="prev">
                <span class="sr-only">Previous</span>
                <span aria-hidden="true">←</span>
              </button>
              <h3 id="current-month">${this.formatDate(this.currentDate, 'MMMM yyyy')}</h3>
              <button class="btn btn-icon" id="next">
                <span class="sr-only">Next</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <div class="calendar-body" id="calendar-body">
            <p>Loading calendar...</p>
          </div>
        </div>
      `;
        
        // Add styles
        this.addStyles();
  
        // Set up event listeners
        this.setupEventListeners();
  
        // Add popstate handler for browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState);
  
        // Load events
        this.loadEvents();
      }
  
      /**
       * Create the calendar header
       * @private
       */
      createHeader() {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        
        // Create date picker
        this.datePicker = new DatePicker({
          initialDate: this.currentDate,
          onChange: this.handleDateChange,
          theme: this.theme
        });
        
        // Create view toggle
        this.viewToggle = new ViewToggle({
          initialView: this.currentView,
          onChange: this.handleViewChange,
          theme: this.theme
        });
        
        // Create header content container
        const headerContent = document.createElement('div');
        headerContent.className = 'calendar-header__content';
        
        // Add date picker to header
        const datePickerContainer = document.createElement('div');
        datePickerContainer.className = 'calendar-date-picker';
        this.datePicker.render(datePickerContainer);
        headerContent.appendChild(datePickerContainer);
        
        // Add view toggle to header
        const viewToggleContainer = document.createElement('div');
        viewToggleContainer.className = 'calendar-view-toggle';
        this.viewToggle.render(viewToggleContainer);
        headerContent.appendChild(viewToggleContainer);
        
        header.appendChild(headerContent);
        
        return header.outerHTML;
      }
  
      /**
       * Add calendar styles
       * @private
       */
      addStyles() {
        const styleId = 'sonar-calendar-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
        .sonar-calendar {
          max-width: 800px;
          margin: 0 auto;
          font-family: var(--font-sans);
        }
        
        .calendar-header {
          margin-bottom: 1.5rem;
        }
        
        .calendar-header__content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .calendar-date-picker {
          flex: 1;
        }
        
        .calendar-view-toggle {
          flex-shrink: 0;
        }
        
        .calendar-header__content {
          display: flex;
          align-items: center;
        }
        
        .calendar-title {
          font-size: 1.5rem;
          color: var(--color-text);
          margin: 0 0 1rem 0;
        }
        
        .calendar-view-toggle {
          margin-left: 1rem;
        }
        
        .calendar-events-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        
        .no-events {
          color: var(--color-text-muted);
          font-style: italic;
          grid-column: 1 / -1;
          text-align: center;
          padding: 2rem 0;
        }
      `;
        
        document.head.appendChild(style);
      }
      
      /**
       * Apply the specified theme
       * @param {string} theme - The theme to apply ('light' or 'dark')
       */
      setTheme(theme) {
        this.theme = theme;
        if (this.viewToggle) {
          this.viewToggle.setTheme(theme);
        }
        this.updateCalendar();
      }
  
      /**
       * Set up event listeners
       * @private
       */
      setupEventListeners() {
        // Navigation buttons
        const prevBtn = this.container.querySelector('#prev');
        const nextBtn = this.container.querySelector('#next');
  
        if (prevBtn) {
          prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => this.navigate(1));
        }
      }
  
      /**
       * Handle event click
       * @param {Object} event - The event data
       * @private
       */
      handleEventClick(event) {
        this.activeEvent = event;
        this.showEventDetails(event);
      }
  
      /**
       * Show event details
       * @param {Object} event - The event data to display
       * @private
       */
      showEventDetails(event) {
        // Close any open event details
        this.closeEventDetails();
        
        // Create and show new event details
        this.activeEventDetails = new EventDetails(
          event,
          this.closeEventDetails.bind(this),
          this.theme
        );
        
        this.activeEventDetails.render(this.container);
        
        // Add to history state
        window.history.pushState(
          { eventId: event.id },
          `Event: ${event.title}`,
          `#event-${event.id}`
        );
      }
  
      /**
       * Close the event details view
       * @private
       */
      closeEventDetails() {
        if (this.activeEventDetails) {
          this.activeEventDetails.close();
          this.activeEventDetails = null;
          this.activeEvent = null;
          
          // Update URL if we're currently viewing an event
          if (window.location.hash.startsWith('#event-')) {
            window.history.pushState(null, '', window.location.pathname);
          }
        }
      }
  
      /**
       * Handle popstate events (back/forward navigation)
       * @private
       */
      handlePopState() {
        const eventId = window.location.hash.replace('#event-', '');
        if (eventId) {
          const event = this.events.find(e => e.id === eventId);
          if (event) {
            this.showEventDetails(event);
          }
        } else {
          this.closeEventDetails();
        }
      }
  
      /**
       * Handle view change events from the view toggle
       * @param {string} view - The new view to switch to
       * @private
       */
      handleViewChange(view) {
        if (['upcoming', 'month', 'week', 'day'].includes(view)) {
          this.currentView = view;
          this.updateCalendar();
        }
      }
  
      /**
       * Handle date change from date picker
       * @param {Date} date - The newly selected date
       * @private
       */
      handleDateChange(date) {
        this.currentDate = new Date(date);
        this.updateCalendar();
      }
  
      /**
       * Navigate between months
       * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
       */
      navigate(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        if (this.datePicker) {
          this.datePicker.setDate(this.currentDate);
        }
        this.updateCalendar();
      }
  
      /**
       * Parse events from a data source
       * @param {string} source - The source of the data ('api' or 'element')
       * @param {Object} [filters] - Optional filters to apply
       * @returns {Promise<Array>} - Parsed events array
       * @private
       */
      async parseEvents(source, filters = {}) {
        try {
          if (source === 'api' && this.apiUrl) {
            // Use the event service to fetch events
            const events = await eventService.getEvents(filters);
            return this.processEvents(events);
          } else if (source === 'element' && this.dataSelector) {
            const element = document.querySelector(this.dataSelector);
            if (!element) {
              throw new Error(`No element found with selector: ${this.dataSelector}`);
            }
            
            // Get the data from the element's value or text content
            const data = element.value !== undefined ? element.value : element.textContent;
            if (!data) {
              throw new Error('No data found in the specified element');
            }
            
            const events = JSON.parse(data);
            return this.processEvents(events);
          }
          return [];
        } catch (error) {
          console.error(`Error parsing events from ${source}:`, error);
          throw error;
        }
      }
  
      /**
       * Process events data
       * @param {Array} events - Array of event objects
       * @returns {Array} - Processed events
       * @private
       */
      processEvents(events) {
        if (!Array.isArray(events)) {
          console.warn('Expected an array of events, got:', events);
          return [];
        }
  
        return events.map(event => ({
          id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: event.title || 'Untitled Event',
          start: event.start ? new Date(event.start) : new Date(),
          end: event.end ? new Date(event.end) : new Date(),
          description: event.description || '',
          location: event.location || '',
          category: event.category || 'default',
          ...event
        }));
      }
  
      /**
       * Load events from the available data source
       * @param {Object} [filters] - Optional filters to apply
       */
      async loadEvents(filters = {}) {
        this.isLoading = true;
        this.error = null;
        this.updateLoadingState();
  
        try {
          // Try to load from API first if available
          if (this.apiUrl) {
            this.events = await this.parseEvents('api', filters);
          } 
          // If no API URL or API failed, try loading from data element if specified
          else if (this.dataSelector) {
            this.events = await this.parseEvents('element', filters);
          } else {
            this.events = [];
            console.warn('No data source specified. Provide either apiUrl or dataSelector.');
          }
          
          this.updateCalendar();
        } catch (error) {
          handleApiError(error, 'Loading events');
          this.error = error.message;
          this.showError(error.message);
        } finally {
          this.isLoading = false;
          this.updateLoadingState();
        }
      }
  
      /**
       * Update the calendar display
       * @private
       */
      updateCalendar() {
        const calendarBody = this.container.querySelector('#calendar-body');
        if (!calendarBody) return;
  
        if (this.currentView === 'upcoming') {
          this.renderUpcomingEvents(calendarBody);
        } else if (this.currentView === 'month') {
          this.renderMonthView(calendarBody);
        } else if (this.currentView === 'week') {
          this.renderWeekView(calendarBody);
        } else if (this.currentView === 'day') {
          this.renderDayView(calendarBody);
        }
      }
  
      /**
       * Render upcoming events
       * @param {HTMLElement} container - The container to render events into
       * @private
       */
      renderUpcomingEvents(container) {
        const upcomingEvents = this.events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= this.currentDate;
        });
  
        this.renderEvents(container, upcomingEvents);
      }
  
      /**
       * Render month view
       * @param {HTMLElement} container - The container to render events into
       * @private
       */
      renderMonthView(container) {
        const monthEvents = this.events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate.getMonth() === this.currentDate.getMonth() && 
                 eventDate.getFullYear() === this.currentDate.getFullYear();
        });
  
        this.renderEvents(container, monthEvents);
      }
  
      /**
       * Render week view
       * @param {HTMLElement} container - The container to render events into
       * @private
       */
      renderWeekView(container) {
        const weekEvents = this.events.filter(event => {
          const eventDate = new Date(event.start);
          const startDate = new Date(this.currentDate);
          startDate.setDate(startDate.getDate() - startDate.getDay());
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
  
          return eventDate >= startDate && eventDate < endDate;
        });
  
        this.renderEvents(container, weekEvents);
      }
  
      /**
       * Render day view
       * @param {HTMLElement} container - The container to render events into
       * @private
       */
      renderDayView(container) {
        const dayEvents = this.events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate.toDateString() === this.currentDate.toDateString();
        });
  
        this.renderEvents(container, dayEvents);
      }
  
      /**
       * Render events in the calendar
       * @param {HTMLElement} container - The container to render events into
       * @param {Array} [events] - Optional events to render (defaults to all events)
       * @private
       */
      renderEvents(container, events = this.events) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-grid';
        
        events.forEach(event => {
          const eventCard = new EventCard(event, this.theme);
          eventCard.element.addEventListener('click', () => this.handleEventClick(event));
          eventCard.element.setAttribute('tabindex', '0');
          eventCard.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.handleEventClick(event);
            }
          });
          eventsContainer.appendChild(eventCard.element);
        });
  
        container.innerHTML = ''; // Clear previous content
        container.appendChild(eventsContainer);
  
        // Show message if no events
        if (events.length === 0) {
          const noEvents = document.createElement('p');
          noEvents.className = 'no-events';
          noEvents.textContent = `No ${this.currentView} events found.`;
          eventsContainer.appendChild(noEvents);
        }
        
        // Check if we need to show an event from the URL hash
        if (window.location.hash.startsWith('#event-') && !this.activeEvent) {
          const eventId = window.location.hash.replace('#event-', '');
          const event = this.events.find(e => e.id.toString() === eventId);
          if (event) {
            // Use setTimeout to ensure the DOM is updated first
            setTimeout(() => this.showEventDetails(event), 0);
          }
        }
      }
  
      /**
       * Update the calendar display
       * @private
       */
      updateCalendar() {
        const calendarBody = this.container.querySelector('#calendar-body') || this.container;
        
        if (this.currentView === 'upcoming') {
          this.renderUpcomingEvents(calendarBody);
        } else if (this.currentView === 'month') {
          this.renderMonthView(calendarBody);
        } else if (this.currentView === 'week') {
          this.renderWeekView(calendarBody);
        } else if (this.currentView === 'day') {
          this.renderDayView(calendarBody);
        }
        
        // Update the title with the current view context
        const titleElement = this.container.querySelector('.calendar-title');
        if (titleElement) {
          if (this.currentView === 'upcoming') {
            titleElement.textContent = 'Upcoming Events';
          } else {
            titleElement.textContent = this.formatDate(this.currentDate, 'MMMM yyyy');
          }
        }
      }
  
      /**
       * Update loading state
       * @private
       */
      updateLoadingState() {
        const calendarBody = this.container.querySelector('#calendar-body');
        if (!calendarBody) return;
  
        if (this.isLoading) {
          calendarBody.innerHTML = '<div class="loading">Loading events...</div>';
        } else if (this.error) {
          calendarBody.innerHTML = `
          <div class="error">
            <p>Error loading events: ${this.error}</p>
            <button class="btn btn-primary" id="retry-load">Retry</button>
          </div>
        `;
          
          const retryBtn = calendarBody.querySelector('#retry-load');
          if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadEvents());
          }
        }
      }
  
      /**
       * Show error message
       * @param {string} message - The error message to display
       * @private
       */
      showError(message) {
        console.error('Calendar Error:', message);
        // Error display is handled in updateLoadingState
      }
  
      /**
       * Format a date string
       * @param {Date} date - The date to format
       * @param {string} format - The format string
       * @returns {string} The formatted date string
       * @private
       */
      formatDate(date, format) {
        // Simple date formatting - can be enhanced with a library like date-fns
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        };
        
        return new Intl.DateTimeFormat('en-US', options).format(date);
      }
    }
  
    /**
     * Sonar Calendar - Main Entry Point
     * 
     * This is the main entry point for the Sonar Calendar library.
     * It initializes the calendar and sets up the necessary event listeners.
     */
  
    /**
     * Initialize the Sonar Calendar
     * @param {Object} options - Configuration options for the calendar
     * @param {string} options.selector - CSS selector for the container element
     * @param {string} [options.theme='light'] - Theme to use ('light' or 'dark')
     * @param {string} [options.apiUrl] - Base URL for the events API
     * @param {string} [options.dataSelector] - CSS selector for an element containing JSON data
     * @returns {SonarCalendar} - The initialized calendar instance
     */
    function initSonarCalendar(options = {}) {
      const {
        selector = '#calendar',
        theme = 'light',
        apiUrl,
        dataSelector
      } = options;
  
      // Find the container element
      const container = document.querySelector(selector);
      if (!container) {
        console.error(`No element found with selector: ${selector}`);
        return null;
      }
  
      // Initialize the calendar
      const calendar = new SonarCalendar({
        container,
        theme,
        apiUrl,
        dataSelector
      });
  
      return calendar;
    }
  
    // Export the initialization function and main class
    const SonarCalendarLib = {
      init: initSonarCalendar,
      Calendar: SonarCalendar,
      VERSION: '1.0.0' // Add version info
    };
  
    // For UMD/script tag usage
    if (typeof window !== 'undefined') {
      window.SonarCalendar = SonarCalendarLib;
    }
  
    // For CommonJS
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = SonarCalendarLib;
    }
  
    exports.SonarCalendar = SonarCalendar;
    exports["default"] = SonarCalendarLib;
  
    Object.defineProperty(exports, '__esModule', { value: true });
  
  }));
  //# sourceMappingURL=sonar-calendar.js.map