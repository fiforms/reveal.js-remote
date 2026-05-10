export default (options = {}) => {
  let reveal = null
  let currentZoom = null
  let currentSlideElement = null
  let isRemoteZoom = false
  const isFollower = options.isFollower || false

  function setupForSlideElement(element) {
    currentSlideElement = element
  }

  return {
    id: 'remote-zoom-sync',
    init: (initReveal) => {
      reveal = initReveal

      reveal.addEventListener('slidechanged', (e) => {
        setupForSlideElement(e.currentSlide)
      })
      reveal.addEventListener('ready', (e) => {
        setupForSlideElement(e.currentSlide)
      })

      if (isFollower) {
        // On follower: listen for zoom events and emit synthetic Ctrl+clicks for standard Zoom plugin
        // Also prevent local Ctrl+clicks from zooming—only presenter's zoom broadcasts should work
        function onFollowerCtrlClick(e) {
          // Allow remote zoom synthetic events through, block only local user Ctrl+clicks
          if ((e.ctrlKey || e.metaKey) && e.button === 0 && !isRemoteZoom) {
            e.preventDefault();
            e.stopPropagation();
          }
        }

        document.addEventListener('mousedown', onFollowerCtrlClick, true);

        reveal.on('enable-zoom', (e) => {
          const focus = e.detail?.focus || e.focus;
          if (!currentSlideElement || !focus) {
            return;
          }
          const rect = currentSlideElement.getBoundingClientRect();
          const clickX = rect.left + (focus.x / 100) * rect.width;
          const clickY = rect.top + (focus.y / 100) * rect.height;

          const syntheticEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            altKey: true,
            metaKey: true,
            clientX: clickX,
            clientY: clickY,
            button: 0,
            view: window
          });

          // Mark as remote zoom so onFollowerCtrlClick doesn't block it
          isRemoteZoom = true;
          reveal.getRevealElement().dispatchEvent(syntheticEvent);
          isRemoteZoom = false;
        });
        reveal.on('disable-zoom', () => {
          if (!currentSlideElement) return;
          const syntheticEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Escape'
          });
          document.dispatchEvent(syntheticEvent);
        });
        reveal.on('overviewshown', () => {
          if (!currentSlideElement) return;
          const syntheticEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Escape'
          });
          document.dispatchEvent(syntheticEvent);
        });
      } else {
        // On presenter: intercept Ctrl+click to capture coordinates for followers
        function onMouseDown(e) {
          if ((e.ctrlKey || e.metaKey) && currentSlideElement && e.button === 0) {
            const rect = currentSlideElement.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const focusX = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
            const focusY = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));

            const focus = { x: focusX, y: focusY };
            currentZoom = focus;

            // Broadcast zoom to followers (let original event propagate to Zoom plugin)
            reveal.dispatchEvent({
              type: 'enable-zoom',
              focus: focus
            });
          }
        }

        function onKeyDown(e) {
          if (e.key === 'Escape' && currentZoom !== null) {
            currentZoom = null;
            reveal.dispatchEvent({ type: 'disable-zoom' });
          }
        }

        document.addEventListener('mousedown', onMouseDown, true);
        document.addEventListener('keydown', onKeyDown, true);

        reveal.addEventListener('overviewshown', () => {
          if (currentZoom !== null) {
            currentZoom = null;
            reveal.dispatchEvent({ type: 'disable-zoom' });
          }
        });
      }
    },
    getCurrentZoom: () => currentZoom,
    setCurrentZoom: (focus) => {
      if (!isFollower || !currentSlideElement) {
        return;
      }

      if (focus === null) {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        }));
      } else {
        // Emit synthetic Ctrl+click at the focus coordinates
        const rect = currentSlideElement.getBoundingClientRect();
        const clickX = rect.left + (focus.x / 100) * rect.width;
        const clickY = rect.top + (focus.y / 100) * rect.height;

        const syntheticEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          ctrlKey: true,
          altKey: true,
          metaKey: true,
          clientX: clickX,
          clientY: clickY,
          button: 0,
          view: window
        });

        // Mark as remote zoom so onFollowerCtrlClick doesn't block it
        isRemoteZoom = true;
        reveal.getRevealElement().dispatchEvent(syntheticEvent);
        isRemoteZoom = false;
      }
    }
  }
};
