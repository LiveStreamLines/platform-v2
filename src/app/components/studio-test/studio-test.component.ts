import { Component, ElementRef, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environment/environments';

interface DrawableElement {
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'watermark';
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  [key: string]: any; // For additional properties
}

@Component({
  selector: 'app-studio-test',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './studio-test.component.html',
  styleUrl: './studio-test.component.css'
})
export class StudioTestComponent {

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() imageSrc!: string;

  @ViewChild('watermarkInput', { static: false }) watermarkInput!: ElementRef<HTMLInputElement>;

  private context!: CanvasRenderingContext2D;
  image = new Image();
  private rect!: DOMRect;
  private scaleX!: number;
  private scaleY!: number;

  // Drawing state
  currentTool: string = '';
  isDrawing: boolean = false;
  dragStart: { x: number; y: number } | null = null;
  selectedElement: DrawableElement | null = null;

  // Text properties
  fontSize: number = 60;
  fontColor: string = '#000000';
  textValue: string = '';
  texts: { id: string; x: number; y: number; text: string; fontSize: number; color: string; selected: boolean }[] = [];

  // Shape properties
  shapes: {
    id: string;
    type: 'rectangle' | 'circle' | 'arrow';
    x: number;
    y: number;
    endX: number;
    endY: number;
    width: number;
    height: number;
    fillColor: string;
    borderColor: string;
    borderWidth: number;
    color: string;
    lineWidth?: number;
    moveMode?: boolean;
    selected?: boolean;
  }[] = [];

  // Watermark properties
  watermarks: {
    id: string;
    image: HTMLImageElement | null;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    moveMode: boolean;
    selected: boolean;
  }[] = [];
  currentWatermark: any = null;

  // Effects
  brightness: number = 1;
  contrast: number = 1;
  saturation: number = 1;

  loadingCanvas: boolean = false;
  Math = Math;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageSrc'] && this.imageSrc) {
      this.loadImage();
    }
  }

  // Unified tool selection
  selectTool(tool: string): void {
    this.currentTool = tool;
    this.deselectAll();
  }

  // Unified element selection
  private deselectAll(): void {
    this.texts.forEach(t => t.selected = false);
    this.shapes.forEach(s => s.selected = false);
    this.watermarks.forEach(w => w.selected = false);
    this.selectedElement = null;
    this.currentWatermark = null;
    // Don't update canvas here to avoid unnecessary redraws
    // Canvas will be updated when new selection is made
  }

  // Image loading
  private loadImage(): void {
    this.image.crossOrigin = 'anonymous';
    this.image.src = this.imageSrc;
    this.image.onload = () => {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = this.image.width;
      canvas.height = this.image.height;
      this.rect = canvas.getBoundingClientRect();
      this.scaleX = canvas.width / this.rect.width;
      this.scaleY = canvas.height / this.rect.height;
      this.updateCanvas();
    };
    this.image.onerror = () => {
      console.error('Failed to load image:', this.imageSrc);
    };
  }

  // Unified canvas update
  private updateCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = this.context;
  
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply effects and draw base image
    context.filter = `brightness(${this.brightness}) contrast(${this.contrast}) saturate(${this.saturation})`;
    context.drawImage(this.image, 0, 0);
    context.filter = 'none';

    // Draw all elements
    this.drawWatermarks(context);
    this.drawTexts(context);
    this.drawShapes(context);
  }

  private drawWatermarks(context: CanvasRenderingContext2D): void {
    this.watermarks.forEach(watermark => {
      if (watermark.image) {
        context.globalAlpha = watermark.opacity;
        context.drawImage(
          watermark.image,
          watermark.x,
          watermark.y,
          watermark.width,
          watermark.height
        );
        if (watermark.selected) {
          context.globalAlpha = 1;
          context.strokeStyle = 'blue';
          context.lineWidth = 2;
          context.strokeRect(
            watermark.x - 2,
            watermark.y - 2,
            watermark.width + 4,
            watermark.height + 4
          );
        }
      }
    });
    context.globalAlpha = 1;
  }

  private drawTexts(context: CanvasRenderingContext2D): void {
    this.texts.forEach((text, index) => {
      context.font = `${text.fontSize}px Arial`;
      context.fillStyle = text.color;
      context.fillText(text.text, text.x, text.y);
      
      if (text.selected) {
        const textWidth = context.measureText(text.text).width;
        const textHeight = text.fontSize;
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.strokeRect(text.x - 5, text.y - textHeight, textWidth + 10, textHeight + 10);
      }
    });
  }

  private drawShapes(context: CanvasRenderingContext2D): void {
    this.shapes.forEach((shape, index) => {
      context.beginPath();

      if (shape.type === 'rectangle') {
        context.fillStyle = shape.fillColor;
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
        if (shape.borderColor && shape.borderWidth > 0) {
          context.strokeStyle = shape.borderColor;
          context.lineWidth = shape.borderWidth;
          context.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        if (shape.selected) {
          context.strokeStyle = 'blue';
          context.lineWidth = 2;
          context.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
      } else if (shape.type === 'circle') {
        const radiusX = Math.abs(shape.width) / 2;
        const radiusY = Math.abs(shape.height) / 2;
        const centerX = shape.x + radiusX;
        const centerY = shape.y + radiusY;
        context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        context.fillStyle = shape.fillColor;
        context.fill();
        if (shape.borderColor && shape.borderWidth > 0) {
          context.strokeStyle = shape.borderColor;
          context.lineWidth = shape.borderWidth;
          context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          context.stroke();
        }
        if (shape.selected) {
          context.strokeStyle = 'blue';
          context.lineWidth = 2;
          context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          context.stroke();
        }
      } else if (shape.type === 'arrow') {
        context.strokeStyle = shape.color;
        context.lineWidth = shape.lineWidth || 2;
        context.moveTo(shape.x, shape.y);
        context.lineTo(shape.endX, shape.endY);
        context.stroke();

        const arrowAngle = Math.atan2(shape.endY - shape.y, shape.endX - shape.x);
        const arrowHeadLength = 50;
        context.moveTo(shape.endX, shape.endY);
        context.lineTo(
          shape.endX - arrowHeadLength * Math.cos(arrowAngle - Math.PI / 6),
          shape.endY - arrowHeadLength * Math.sin(arrowAngle - Math.PI / 6)
        );
        context.moveTo(shape.endX, shape.endY);
        context.lineTo(
          shape.endX - arrowHeadLength * Math.cos(arrowAngle + Math.PI / 6),
          shape.endY - arrowHeadLength * Math.sin(arrowAngle + Math.PI / 6)
        );
        context.stroke();

        if (shape.selected) {
          context.strokeStyle = 'blue';
          context.lineWidth = 2;
          context.strokeRect(
            Math.min(shape.x, shape.endX),
            Math.min(shape.y, shape.endY),
            Math.abs(shape.endX - shape.x),
            Math.abs(shape.endY - shape.y)
          );
        }
      }
      context.closePath();
    });
  }

  // Unified mouse event handlers
  onCanvasClick(event: MouseEvent): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      return;
    }

    const { x, y } = this.getCanvasCoordinates(event);
    this.handleClick(x, y);
  }

  private handleClick(x: number, y: number): void {
    // First, check if clicking on any existing element (regardless of current tool)
    // Check text first
    const clickedText = this.texts.find(t => this.isPointInsideText(t, x, y));
    if (clickedText) {
      this.deselectAll(); // Deselect all other elements first
      this.currentTool = 'text';
      this.selectText(clickedText);
      return;
    }

    // Check shapes
    const clickedShape = this.shapes.find(s => this.isPointInsideShape(s, x, y));
    if (clickedShape) {
      this.deselectAll(); // Deselect all other elements first
      this.currentTool = clickedShape.type; // Switch to the shape's tool type
      this.selectShape(clickedShape);
      return;
    }

    // Check watermarks
    const clickedWatermark = this.watermarks.find(w => this.isPointInsideWatermark(w, x, y));
    if (clickedWatermark) {
      this.deselectAll(); // Deselect all other elements first
      this.currentTool = 'watermark';
      this.selectWatermark(clickedWatermark);
      return;
    }

    // If no element was clicked, handle based on current tool
    this.deselectAll();

    switch (this.currentTool) {
      case 'text':
        this.createText(x, y);
        break;
      case 'rectangle':
      case 'circle':
      case 'arrow':
        // Don't create on click, wait for mouse down
        break;
      case 'watermark':
        // Don't create on click, wait for mouse down
        break;
    }
  }

  onCanvasMouseDown(event: MouseEvent): void {
    const { x, y } = this.getCanvasCoordinates(event);
    this.dragStart = { x, y };
    this.isDrawing = true;

    // First check if clicking on any existing element (to handle selection and tool switching)
    const clickedText = this.texts.find(t => this.isPointInsideText(t, x, y));
    if (clickedText) {
      this.deselectAll(); // Deselect all other elements first
      this.currentTool = 'text';
      this.selectText(clickedText);
      return; // Will be handled in mouse move for dragging
    }

    const clickedShape = this.shapes.find(s => this.isPointInsideShape(s, x, y));
    if (clickedShape) {
      this.deselectAll(); // Deselect all other elements first
      this.currentTool = clickedShape.type;
      this.selectShape(clickedShape);
      // If in move mode, will be handled in mouse move
      if (clickedShape.moveMode) {
        return;
      }
      // If not in move mode and clicking on shape, start resizing
      return;
    }

    const clickedWatermark = this.watermarks.find(w => this.isPointInsideWatermark(w, x, y));
    if (clickedWatermark) {
      this.deselectAll(); // Deselect all other elements first
      this.currentTool = 'watermark';
      this.selectWatermark(clickedWatermark);
      // Will be handled in mouse move for dragging/resizing
      return;
    }

    // If no element is selected or clicked, create new element based on tool
    if (this.currentTool === 'rectangle' || this.currentTool === 'circle') {
      this.createShape(this.currentTool, x, y);
    } else if (this.currentTool === 'arrow') {
      this.createArrow(x, y);
    }
    // Note: Watermarks are created via file upload, not by clicking
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || !this.dragStart) return;

    const { x, y } = this.getCanvasCoordinates(event);
    this.handleDrag(x, y, event);
  }

  private handleDrag(x: number, y: number, event: MouseEvent): void {
    // Handle text dragging (always moves, no resize)
    if (this.currentTool === 'text') {
      const text = this.texts.find(t => t.selected);
      if (text) {
        text.x = x;
        text.y = y;
        this.updateCanvas();
      }
      return;
    }

    // Handle shape dragging
    const selectedShape = this.shapes.find(s => s.selected);
    if (selectedShape) {
      if (selectedShape.moveMode) {
        // Move the entire shape
        const dx = x - this.dragStart!.x;
        const dy = y - this.dragStart!.y;
        selectedShape.x += dx;
        selectedShape.y += dy;
        if (selectedShape.type === 'arrow') {
          selectedShape.endX += dx;
          selectedShape.endY += dy;
        }
        this.dragStart = { x, y };
      } else {
        // Resize the shape
        if (selectedShape.type === 'arrow') {
          selectedShape.endX = x;
          selectedShape.endY = y;
        } else {
          selectedShape.width = x - selectedShape.x;
          selectedShape.height = y - selectedShape.y;
        }
      }
      this.updateCanvas();
      return;
    }

    // Handle watermark dragging
    if (this.currentTool === 'watermark' && this.currentWatermark) {
      if (this.currentWatermark.moveMode) {
        const dx = x - this.dragStart!.x;
        const dy = y - this.dragStart!.y;
        this.currentWatermark.x += dx;
        this.currentWatermark.y += dy;
        this.dragStart = { x, y };
      } else {
        this.currentWatermark.width = x - this.currentWatermark.x;
        this.currentWatermark.height = y - this.currentWatermark.y;
      }
      this.updateCanvas();
    }
  }

  onCanvasMouseUp(): void {
    if (this.isDrawing) {
      // Finalize shape creation
      if (this.currentTool === 'rectangle' || this.currentTool === 'circle') {
        const shape = this.shapes.find(s => s.selected);
        if (shape && (shape.width === 0 || shape.height === 0)) {
          this.shapes = this.shapes.filter(s => s.id !== shape.id);
          this.selectedElement = null;
        }
      }
      if (this.currentTool === 'arrow') {
        const shape = this.shapes.find(s => s.selected && s.type === 'arrow');
        if (shape && shape.x === shape.endX && shape.y === shape.endY) {
          this.shapes = this.shapes.filter(s => s.id !== shape.id);
          this.selectedElement = null;
        }
      }
    }
    this.isDrawing = false;
    this.dragStart = null;
    this.updateCanvas();
  }

  // Element creation
  private createText(x: number, y: number): void {
    const id = this.generateId();
    const newText = {
      id,
      x,
      y,
      text: 'New Text',
      fontSize: this.fontSize,
      color: this.fontColor,
      selected: true
    };
    this.texts.push(newText);
    this.selectText(newText);
    this.updateCanvas();
  }

  private createShape(type: 'rectangle' | 'circle', x: number, y: number): void {
    const id = this.generateId();
    const newShape = {
      id,
      type,
      x,
      y,
      width: 0,
      height: 0,
      endX: 0,
      endY: 0,
      fillColor: 'rgba(0,0,0,0)',
      borderColor: '#000000',
      borderWidth: 10,
      color: '',
      moveMode: false,
      selected: true
    };
    this.shapes.push(newShape);
    this.selectedElement = newShape;
    this.updateCanvas();
  }

  private createArrow(x: number, y: number): void {
    const id = this.generateId();
    const newArrow = {
      id,
      type: 'arrow' as const,
      x,
      y,
      width: 0,
      height: 0,
      endX: x,
      endY: y,
      color: '#000000',
      lineWidth: 10,
      fillColor: '',
      borderColor: '',
      borderWidth: 0,
      moveMode: false,
      selected: true
    };
    this.shapes.push(newArrow);
    this.selectedElement = newArrow;
    this.updateCanvas();
  }

  // Element selection
  private selectText(text: any): void {
    // Ensure all other elements are deselected
    this.shapes.forEach(s => s.selected = false);
    this.watermarks.forEach(w => w.selected = false);
    this.currentWatermark = null;
    
    // Select the text
    this.texts.forEach(t => t.selected = t.id === text.id);
    this.selectedElement = text;
    this.textValue = text.text;
    this.fontSize = text.fontSize;
    this.fontColor = text.color;
    this.updateCanvas();
  }

  private selectShape(shape: any): void {
    // Ensure all other elements are deselected
    this.texts.forEach(t => t.selected = false);
    this.watermarks.forEach(w => w.selected = false);
    this.currentWatermark = null;
    
    // Select the shape
    this.shapes.forEach(s => s.selected = s.id === shape.id);
    this.selectedElement = shape;
    this.currentTool = shape.type; // Switch to the shape's tool type
    this.updateCanvas();
  }

  private selectWatermark(watermark: any): void {
    // Ensure all other elements are deselected
    this.texts.forEach(t => t.selected = false);
    this.shapes.forEach(s => s.selected = false);
    
    // Select the watermark
    this.watermarks.forEach(w => w.selected = w.id === watermark.id);
    this.currentWatermark = watermark;
    this.selectedElement = watermark;
    this.updateCanvas();
  }

  // Element updates
  updateText(): void {
    const text = this.texts.find(t => t.selected);
    if (text) {
      text.text = this.textValue;
      text.fontSize = this.fontSize;
      text.color = this.fontColor;
      this.updateCanvas();
    }
  }

  removeText(): void {
    this.texts = this.texts.filter(t => !t.selected);
    this.selectedElement = null;
    this.updateCanvas();
  }

  updateShape(): void {
    this.updateCanvas();
  }

  // Safe shape property update methods to prevent null reference errors
  updateShapeFillColor(color: string): void {
    const shape = this.getCurrentShape();
    if (shape) {
      shape.fillColor = color;
      this.updateShape();
    }
  }

  updateShapeBorderColor(color: string): void {
    const shape = this.getCurrentShape();
    if (shape) {
      shape.borderColor = color;
      this.updateShape();
    }
  }

  updateShapeBorderWidth(width: number): void {
    const shape = this.getCurrentShape();
    if (shape) {
      shape.borderWidth = width;
      this.updateShape();
    }
  }

  updateShapeColor(color: string): void {
    const shape = this.getCurrentShape();
    if (shape) {
      shape.color = color;
      this.updateShape();
    }
  }

  updateShapeLineWidth(width: number): void {
    const shape = this.getCurrentShape();
    if (shape) {
      shape.lineWidth = width;
      this.updateShape();
    }
  }

  toggleShapeMove(): void {
    const shape = this.shapes.find(s => s.selected);
    if (shape) {
      shape.moveMode = !shape.moveMode;
    }
  }

  deleteShape(): void {
    this.shapes = this.shapes.filter(s => !s.selected);
    this.selectedElement = null;
    this.updateCanvas();
  }

  // Watermark management
  addWatermark(): void {
    this.currentTool = 'watermark';
    const id = this.generateId();
    const newWatermark = {
      id,
      image: null,
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      opacity: 0.5,
      moveMode: false,
      selected: true
    };
    this.watermarks.push(newWatermark);
    this.currentWatermark = newWatermark;
    this.watermarkInput.nativeElement.click();
  }

  handleWatermarkUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.currentWatermark) {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            this.currentWatermark.image = img;
            this.updateCanvas();
          };
        }
      };
      reader.readAsDataURL(file);
    }
  }

  updateWatermark(): void {
    this.updateCanvas();
  }

  toggleWatermarkMove(): void {
    if (this.currentWatermark) {
      this.currentWatermark.moveMode = !this.currentWatermark.moveMode;
    }
  }

  deleteWatermark(): void {
    this.watermarks = this.watermarks.filter(w => w.id !== this.currentWatermark?.id);
    this.currentWatermark = null;
    this.selectedElement = null;
    this.updateCanvas();
  }

  // Effects
  applyEffects(): void {
    this.updateCanvas();
  }

  // Utility methods
  private getCanvasCoordinates(event: MouseEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.scaleX;
    const y = (event.clientY - rect.top) * this.scaleY;
    return { x, y };
  }

  private generateId(): string {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isPointInsideText(text: any, x: number, y: number): boolean {
    this.context.font = `${text.fontSize}px Arial`;
    const textWidth = this.context.measureText(text.text).width;
    const textHeight = text.fontSize;
    return x >= text.x && x <= text.x + textWidth && y >= text.y - textHeight && y <= text.y;
  }

  private isPointInsideShape(shape: any, x: number, y: number): boolean {
    if (shape.type === 'rectangle') {
      return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
    } else if (shape.type === 'circle') {
      const radius = Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2));
      const dx = x - (shape.x + shape.width / 2);
      const dy = y - (shape.y + shape.height / 2);
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    } else if (shape.type === 'arrow') {
      return this.isPointNearArrow(shape, x, y);
    }
    return false;
  }

  private isPointInsideWatermark(watermark: any, x: number, y: number): boolean {
    return x >= watermark.x && x <= watermark.x + watermark.width &&
           y >= watermark.y && y <= watermark.y + watermark.height;
  }

  private isPointNearArrow(shape: any, x1: number, y1: number): boolean {
    const { x, y, endX, endY } = shape;
    const lineLength = Math.sqrt(Math.pow(endX - x, 2) + Math.pow(endY - y, 2));
    if (lineLength === 0) return false;
    const t = ((x1 - x) * (endX - x) + (y1 - y) * (endY - y)) / Math.pow(lineLength, 2);
    const clampedT = Math.max(0, Math.min(1, t));
    const closestX = x + clampedT * (endX - x);
    const closestY = y + clampedT * (endY - y);
    const distanceToLine = Math.sqrt(Math.pow(x1 - closestX, 2) + Math.pow(y1 - closestY, 2));
    return distanceToLine <= 5;
  }

  // Canvas actions
  clearCanvas(): void {
    this.texts = [];
    this.shapes = [];
    this.watermarks = [];
    this.selectedElement = null;
    this.currentWatermark = null;
    this.brightness = 1;
    this.contrast = 1;
    this.saturation = 1;
    this.updateCanvas();
  }

  uploadCanvas(): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = this.canvasRef.nativeElement;
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject('Failed to create Blob from canvas.');
        }
        this.loadingCanvas = true;
        const formData = new FormData();
        formData.append('image', blob, 'canvas_image.png');
        const authh = this.authService.getAuthToken();
        fetch(environment.backend + '/api/studio/save', {
          method: 'POST',
          headers: {
            'Authorization': authh ? `Bearer ${authh}` : '',
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.url) {
              resolve(data.url);
            } else {
              reject('No URL returned from the server.');
            }
          })
          .catch((error) => {
            console.error('Error saving image:', error);
            reject(error);
          })
          .finally(() => {
            this.loadingCanvas = false;
          });
      }, 'image/png');
    });
  }

  downloadImage(imageUrl: string): void {
    fetch(environment.images + "/" + imageUrl)
      .then((response) => response.blob())
      .then((imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'canvas_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(imageUrl);
      })
      .catch((error) => {
        console.error('Error downloading image:', error);
      });
  }

  processCanvas(): void {
    this.uploadCanvas()
      .then((imageUrl) => {
        this.downloadImage(imageUrl);
      })
      .catch((error) => {
        console.error('Error processing canvas:', error);
      });
  }

  // Properties panel helper
  hasActiveSelection(): boolean {
    const selectedText = this.texts.find(t => t.selected);
    const selectedShape = this.shapes.find(s => s.selected);
    return (
      (this.currentTool === 'text' && selectedText !== undefined) ||
      ((this.currentTool === 'rectangle' || this.currentTool === 'circle') && selectedShape !== undefined) ||
      (this.currentTool === 'arrow' && selectedShape?.type === 'arrow') ||
      (this.currentTool === 'watermark' && this.currentWatermark !== null) ||
      this.currentTool === 'effect'
    );
  }

  // Getters for template
  get selectedTextIndex(): number | null {
    const index = this.texts.findIndex(t => t.selected);
    return index >= 0 ? index : null;
  }

  get selectedShapeIndex(): number | null {
    const index = this.shapes.findIndex(s => s.selected);
    return index >= 0 ? index : null;
  }

  getCurrentShape(): any {
    return this.shapes.find(s => s.selected) || null;
  }

}