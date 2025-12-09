import { Component, ElementRef, OnInit, Renderer2, Input, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../services/token.service';
import { LiveCameraService, LiveCamera } from '../../services/live-camera.service';

@Component({
  selector: 'app-camera-feed',
  standalone: true,
  imports: [],
  templateUrl: './camera-feed.component.html',
  styleUrl: './camera-feed.component.css'
})
export class CameraFeedComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() projectTag!: string;
  @Input() cameraId: string = 'main'; // Default to main camera if not specified

  private appKey = "itwwm7benooi6li6p4p1xrz5rsgy1l9e";
  private appSecret = "kpivtt3r0bfv4eb2dl7apv1icyl8z48z";

  private accessToken: string = "";
  private streamToken: string = "";
  private secretKey: string = "";
  private serialNumber: string = "";
  private accessTokenExpiry: number = 0;
  private streamTokenExpiry: number = 0;

  private channelNumber = "1";
  private videoResolution = "hd";
  private domain = "https://isgpopen.ezvizlife.com";
  private pluginScriptUrl = 'assets/dist/jsPlugin-3.0.0.min.js';
  private oPlugin: any = null;
  private resizeTimeout: any;
  private isResizing = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private isInitialized = false;
  private cameraData: LiveCamera | null = null;

  // Minimum dimensions for different screen sizes
  private readonly MIN_DIMENSIONS = {
    default: { width: 640, height: 360 },
    tablet: { width: 480, height: 270 },
    mobile: { width: 320, height: 180 },
    smallMobile: { width: 280, height: 157.5 },
    extraSmall: { width: 240, height: 135 },
    verySmall: { width: 200, height: 112.5 }
  };

  constructor(
    private elRef: ElementRef, 
    private renderer: Renderer2, 
    private http: HttpClient,
    private tokenService: TokenService,
    private liveCameraService: LiveCameraService
  ) {}

  ngOnInit(): void {
    if (!this.projectTag) {
      console.error("ProjectTag is missing!");
      this.showError("Project tag is required");
      return;
    }

    this.loadCameraData();
  }

  private loadCameraData(): void {
    // Fetch all cameras and filter by projectTag and cameraId
    this.liveCameraService.getAllLiveCameras().subscribe({
      next: (cameras) => {
        // Find the camera matching projectTag and cameraId
        const camera = cameras.find(c => 
          c.projectTag === this.projectTag && c.id === this.cameraId
        );
        
        if (camera && camera.secretKey && camera.serialNumber) {
          this.cameraData = camera;
          this.secretKey = camera.secretKey;
          this.serialNumber = camera.serialNumber;
          
          console.log("Camera data loaded:", camera);
          console.log("Camera details:", { 
            projectTag: this.projectTag, 
            cameraId: this.cameraId,
            serialNumber: this.serialNumber, 
            secretKey: this.secretKey ? "***" : "Not set" 
          });

          this.logDebugInfo();
          this.initializeCameraFeed();
        } else {
          console.error("Camera not found or missing secretKey/serialNumber:", { 
            projectTag: this.projectTag, 
            cameraId: this.cameraId 
          });
          this.showError(`Camera not found for project: ${this.projectTag}, camera: ${this.cameraId}`);
        }
      },
      error: (err) => {
        console.error("Error loading camera data:", err);
        this.showError("Failed to load camera configuration");
      }
    });
  }

  private initializeCameraFeed(): void {
    console.log("Starting camera feed initialization...");
    this.showLoading();
    
    this.tokenService.getAllTokens().subscribe({
      next: (tokens) => {
        console.log("Tokens Received:", tokens);
        
        // Validate tokens
        if (!tokens || !tokens.accessToken || !tokens.streamToken) {
          console.error("Invalid tokens received:", tokens);
          this.showError("Failed to get valid tokens");
          return;
        }

        this.accessToken = tokens.accessToken;
        this.accessTokenExpiry = tokens.accessTokenExpiry;
        this.streamToken = tokens.streamToken;
        this.streamTokenExpiry = tokens.streamTokenExpiry;
        
        console.log("Token validation passed");
        console.log("Access token expiry:", new Date(this.accessTokenExpiry).toLocaleString());
        console.log("Stream token expiry:", new Date(this.streamTokenExpiry).toLocaleString());
        
        if (this.isTokenExpired(this.accessTokenExpiry) || this.isTokenExpired(this.streamTokenExpiry)) {
          console.log("Tokens expired, attempting to refresh...");
          this.showError("Tokens expired. Please refresh the page or contact support.");
          return;
        }

        console.log("Tokens are valid, proceeding with Live View.");
        this.loadScript()
          .then(() => {
            console.log("Script loaded successfully, initializing live view...");
            return this.initializeLiveView();
          })
          .catch(error => {
            console.error("Failed to load plugin script:", error);
            this.showError("Failed to load camera plugin");
          });
      },
      error: (error) => {
        console.error("Error fetching tokens:", error);
        this.showError("Failed to connect to camera service");
      }
    });
  }

  private showError(message: string, showRetry: boolean = true): void {
    const container = this.elRef.nativeElement.querySelector("#playWind");
    if (container) {
      const retryButton = showRetry ? `
        <button onclick="window.retryCameraFeed && window.retryCameraFeed()" 
                style="
                  margin-top: 15px; 
                  padding: 8px 16px; 
                  background: #4CAF50; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 12px;
                ">
          Retry
        </button>
      ` : '';

      container.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          height: 100%; 
          color: #ff6b6b; 
          text-align: center;
          padding: 20px;
        ">
          <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
          <div style="font-size: 14px; margin-bottom: 5px;">Camera Feed Error</div>
          <div style="font-size: 12px; color: #ccc; margin-bottom: 10px;">${message}</div>
          <div style="font-size: 10px; color: #888;">Project: ${this.projectTag}</div>
          ${retryButton}
        </div>
      `;

      // Add retry function to window for button access
      if (showRetry) {
        (window as any).retryCameraFeed = () => {
          console.log("Retrying camera feed...");
          this.retryCount = 0;
          this.initializeCameraFeed();
        };
      }
    }
  }

  private showLoading(): void {
    const container = this.elRef.nativeElement.querySelector("#playWind");
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          height: 100%; 
          color: #4CAF50;
        ">
          <div style="font-size: 24px; margin-bottom: 10px;">📹</div>
          <div style="font-size: 14px;">Loading Camera Feed...</div>
          <div style="font-size: 10px; color: #888; margin-top: 5px;">Project: ${this.projectTag}</div>
        </div>
      `;
    }
  }

  private logDebugInfo(): void {
    console.log("=== Camera Feed Debug Info ===");
    console.log("Project Tag:", this.projectTag);
    console.log("Camera ID:", this.cameraId);
    console.log("Serial Number:", this.serialNumber);
    console.log("Secret Key:", this.secretKey ? "***" : "Not set");
    console.log("Access Token:", this.accessToken ? "***" : "Not set");
    console.log("Stream Token:", this.streamToken ? "***" : "Not set");
    console.log("Access Token Expiry:", new Date(this.accessTokenExpiry).toLocaleString());
    console.log("Stream Token Expiry:", new Date(this.streamTokenExpiry).toLocaleString());
    console.log("Plugin Script URL:", this.pluginScriptUrl);
    console.log("JSPlugin Available:", !!(window as any).JSPlugin);
    console.log("Container Found:", !!this.elRef.nativeElement.querySelector("#playWind"));
    console.log("=============================");
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.forceContainerSize();
      const dimensions = this.getContainerDimensions();
      console.log('Initial container dimensions:', dimensions);
    }, 100);
  }

  ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.oPlugin) {
      this.stopPlayback();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isResizing) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.isResizing = true;
    this.resizeTimeout = setTimeout(() => {
      this.isResizing = false;
      if (this.oPlugin) {
        this.handleResize();
      }
    }, 250); // Debounce resize events
  }

  private handleResize() {
    this.forceContainerSize();
    const dimensions = this.getContainerDimensions();
    
    // Pause playback during resize
    this.pausePlayback().then(() => {
      this.updateVideoDimensions().then(() => {
        // Resume playback after resize
        setTimeout(() => {
          this.resumePlayback();
        }, 500);
      });
    });
  }

  private async pausePlayback(): Promise<void> {
    if (this.oPlugin) {
      try {
        await this.oPlugin.JS_Pause();
        console.log("Playback paused during resize");
      } catch (error) {
        console.error("Error pausing playback:", error);
      }
    }
  }

  private async resumePlayback(): Promise<void> {
    if (this.oPlugin) {
      try {
        await this.oPlugin.JS_Resume();
        console.log("Playback resumed after resize");
      } catch (error) {
        console.error("Error resuming playback:", error);
      }
    }
  }

  private stopPlayback(): void {
    if (this.oPlugin) {
      try {
        this.oPlugin.JS_Stop();
        console.log("Playback stopped");
      } catch (error) {
        console.error("Error stopping playback:", error);
      }
    }
  }

  private getMinDimensions(): { width: number; height: number } {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 280) return this.MIN_DIMENSIONS.verySmall;
    if (windowWidth <= 360) return this.MIN_DIMENSIONS.extraSmall;
    if (windowWidth <= 480) return this.MIN_DIMENSIONS.smallMobile;
    if (windowWidth <= 768) return this.MIN_DIMENSIONS.mobile;
    if (windowWidth <= 1024) return this.MIN_DIMENSIONS.tablet;
    return this.MIN_DIMENSIONS.default;
  }

  private forceContainerSize() {
    const container = this.elRef.nativeElement.querySelector("#playWind");
    const parentContainer = this.elRef.nativeElement.querySelector(".playContainer");
    
    if (container && parentContainer) {
      const parentRect = parentContainer.getBoundingClientRect();
      const minDims = this.getMinDimensions();
      
      const width = Math.max(parentRect.width, minDims.width);
      const height = Math.max(parentRect.height, minDims.height);
      
      this.renderer.setStyle(container, 'width', `${width}px`);
      this.renderer.setStyle(container, 'height', `${height}px`);
      
      console.log('Forced container size:', { width, height, minDims });
    }
  }

  private getContainerDimensions() {
    const container = this.elRef.nativeElement.querySelector("#playWind");
    if (!container) {
      const minDims = this.getMinDimensions();
      console.warn("Container not found, using fallback dimensions:", minDims);
      return minDims;
    }

    const rect = container.getBoundingClientRect();
    const minDims = this.getMinDimensions();
    const dimensions = {
      width: Math.max(Math.floor(rect.width), minDims.width),
      height: Math.max(Math.floor(rect.height), minDims.height)
    };

    console.log('Container dimensions:', dimensions, 'Min dimensions:', minDims);
    return dimensions;
  }

  private async updateVideoDimensions(): Promise<void> {
    const dimensions = this.getContainerDimensions();
    console.log('Updating video dimensions to:', dimensions);
    
    if (this.oPlugin) {
      try {
        await this.oPlugin.JS_Resize(dimensions.width, dimensions.height);
        console.log("JS_Resize success");
      } catch (error) {
        console.error("JS_Resize failed:", error);
        if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          console.log(`Retrying resize (${this.retryCount}/${this.MAX_RETRIES})...`);
          await this.updateVideoDimensions();
        } else {
          console.error("Max retries reached for resize operation");
          this.retryCount = 0;
        }
      }
    }
  }

  private isTokenExpired(expiryTime: number): boolean {
    const currentTime = Date.now();
    return currentTime >= expiryTime;
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('jsPluginScript')) {
        resolve();
        return;
      }

      const script = this.renderer.createElement('script');
      script.id = 'jsPluginScript';
      script.type = 'text/javascript';
      script.src = this.pluginScriptUrl;
      script.onload = () => resolve();
      script.onerror = () => reject("Failed to load script: " + this.pluginScriptUrl);
      this.renderer.appendChild(document.body, script);
    });
  }

  private async initializeLiveView(): Promise<void> {
    const container = this.elRef.nativeElement.querySelector("#playWind");

    if (!container) {
      console.error("Live View container not found!");
      this.showError("Camera container not found");
      return;
    }

    // Show loading state
    this.showLoading();

    try {
      await this.forceContainerSize();
      const dimensions = this.getContainerDimensions();
      console.log('Initializing LiveView with dimensions:', dimensions);

      // Check if JSPlugin is available
      if (!(window as any).JSPlugin) {
        throw new Error("JSPlugin not loaded");
      }

      this.oPlugin = new (window as any).JSPlugin({
        szId: "playWind",
        iWidth: dimensions.width,
        iHeight: dimensions.height,
        szBasePath: "./assets/dist",
        iMaxSplit: 1,
        oStyle: {
          border: "#343434",
          background: "#4C4B4B"
        }
      });

      await this.oPlugin.JS_ArrangeWindow(1, false);
      console.log("JS_ArrangeWindow success");
      
      await this.updateVideoDimensions();

      const url = `ezopen://open.ezviz.com/${this.serialNumber}/${this.channelNumber}`;
      const finalUrl = this.videoResolution === "hd" ? `${url}.hd.live` : `${url}.live`;

      console.log("Attempting to play URL:", finalUrl);

      if (this.secretKey) {
        await this.oPlugin.JS_SetSecretKey(0, this.secretKey);
        console.log("JS_SetSecretKey success");
      }

      await this.oPlugin.JS_Play(finalUrl, {
        playURL: finalUrl,
        ezuikit: true,
        env: { domain: this.domain },
        accessToken: this.streamToken,
        mode: "media"
      }, 0);
      
      console.log("LiveView initialized successfully");
      this.isInitialized = true;

      // Add event listeners for plugin events
      this.setupPluginEventListeners();
      
    } catch (error: any) {
      console.error("Error initializing LiveView:", error);
      this.showError(`Camera initialization failed: ${error?.message || 'Unknown error'}`);
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        console.log(`Retrying initialization (${this.retryCount}/${this.MAX_RETRIES})...`);
        setTimeout(() => this.initializeLiveView(), 1000);
      } else {
        console.error("Max retries reached for initialization");
        this.retryCount = 0;
        this.showError("Failed to initialize camera after multiple attempts");
      }
    }
  }

  private setupPluginEventListeners(): void {
    if (this.oPlugin) {
      try {
        // Listen for play events
        this.oPlugin.JS_AddEventListener("play", () => {
          console.log("Camera feed started playing");
        });

        // Listen for error events
        this.oPlugin.JS_AddEventListener("error", (error: any) => {
          console.error("Camera plugin error:", error);
          this.showError("Camera feed error occurred");
        });

        // Listen for stop events
        this.oPlugin.JS_AddEventListener("stop", () => {
          console.log("Camera feed stopped");
        });
      } catch (error) {
        console.error("Error setting up plugin event listeners:", error);
      }
    }
  }
}
