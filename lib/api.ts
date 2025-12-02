import { materialMasterData, suppliersData, inventoryData, projectsData, forecastsData, procurementData } from './data';

type ProcurementRecord = (typeof procurementData)[number];
interface CostedMaterial { totalCost: number }

const DEFAULT_UNIT_COSTS: Record<string, number> = {
  'Steel Towers': 850000,
  'Conductors': 450,
  'Insulator Strings': 1200,
  'Substation Equipment': 1250000,
};

interface DashboardStats {
  activeProjects: number;
  totalMaterials: number;
  monthlySpend: number;
  forecastAccuracy: number;
  atRiskMaterials: number;
  criticalProjects: number;
  pendingOrders: number;
  lastUpdated: string;
}

class API {
  syncAllData() {
    this.updateInventoryAlerts();
    this.updateProcurementRecommendations();
    this.calculateForecastAccuracy();
  }

  updateInventoryAlerts() {
    // Implementation for inventory alerts
  }

  updateProcurementRecommendations() {
    // Implementation for procurement recommendations
  }

  calculateForecastAccuracy(): number {
    const completedForecasts = forecastsData.filter(f => f.actualQty !== null);
    if (completedForecasts.length === 0) return 94.5;
    
    let totalAccuracy = 0;
    completedForecasts.forEach(f => {
      const accuracy = f.actualQty ? (1 - Math.abs(f.forecastedQty - f.actualQty) / f.actualQty) * 100 : 0;
      totalAccuracy += Math.max(0, accuracy);
    });
    
    return Number((totalAccuracy / completedForecasts.length).toFixed(1));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const atRiskMaterials = 0; // Calculate based on inventory
    const criticalProjects = projectsData.filter(p => {
      const fulfillment = this.calculateProjectFulfillment(p.id);
      return fulfillment < 70;
    }).length;
    
    const monthlySpend = procurementData
      .filter(po => {
        const orderDate = new Date(po.orderDate);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, po: ProcurementRecord) => sum + po.totalCost, 0);
    
    const pendingOrders = procurementData.filter(po => po.status === 'Pending' || po.status === 'Approved').length;
    
    return {
      activeProjects: projectsData.filter(p => p.status === 'In Progress').length,
      totalMaterials: materialMasterData.length,
      monthlySpend,
      forecastAccuracy: this.calculateForecastAccuracy(),
      atRiskMaterials,
      criticalProjects,
      pendingOrders,
      lastUpdated: new Date().toLocaleString()
    };
  }

  calculateProjectFulfillment(projectId: string): number {
    const project = projectsData.find(p => p.id === projectId);
    if (!project || !project.materialRequirements) return 100;
    
    let totalRequired = 0;
    let totalAllocated = 0;
    
    project.materialRequirements.forEach(req => {
      totalRequired += req.quantity;
      totalAllocated += req.allocated;
    });
    
    return totalRequired > 0 ? Number((totalAllocated / totalRequired * 100).toFixed(1)) : 100;
  }

  async getProjectsSummary() {
    return projectsData.map(p => ({
      ...p,
      fulfillment: this.calculateProjectFulfillment(p.id)
    }));
  }

  async getProjectById(id: string) {
    const project = projectsData.find(p => p.id === id);
    if (!project) return null;
    
    return {
      ...project,
      fulfillment: this.calculateProjectFulfillment(project.id),
      materials: project.materialRequirements?.map(req => {
        const material = materialMasterData.find(m => m.id === req.materialId);
        return {
          ...req,
          materialName: material?.name,
          unit: material?.unit
        };
      })
    };
  }

  async getMaterialsSummary() {
    return materialMasterData.map(material => {
      const inventory = inventoryData.find(inv => inv.materialId === material.id);
      const availableStock = (inventory?.available ?? inventory?.currentStock ?? 0) + (inventory?.inTransit ?? 0);
      const safetyStock = material.safetyStock ?? 0;
      const reorderLevel = material.reorderLevel ?? 0;

      let status: 'Critical' | 'Low' | 'Good' = 'Good';
      if (availableStock <= safetyStock) {
        status = 'Critical';
      } else if (availableStock <= reorderLevel) {
        status = 'Low';
      }

      return {
        ...material,
        ...inventory,
        status
      };
    });
  }

  async getProcurementOrders() {
    return procurementData.map(po => {
      const material = materialMasterData.find(m => m.id === po.materialId);
      const supplier = suppliersData.find(s => s.id === po.supplierId);
      return {
        ...po,
        materialName: material?.name,
        supplierName: supplier?.name
      };
    });
  }

  async getSuppliers() {
    return [...suppliersData];
  }

  async getForecasts(filters: any = {}) {
    let filtered = [...forecastsData];
    
    if (filters.projectId) {
      filtered = filtered.filter(f => f.projectId === filters.projectId);
    }
    if (filters.materialId) {
      filtered = filtered.filter(f => f.materialId === filters.materialId);
    }
    if (filters.month) {
      filtered = filtered.filter(f => f.month === filters.month);
    }
    
    return filtered.map(f => {
      const material = materialMasterData.find(m => m.id === f.materialId);
      const project = projectsData.find(p => p.id === f.projectId);
      return {
        ...f,
        materialName: material?.name,
        projectName: project?.name
      };
    });
  }

  async generateForecast(formData: any) {
    const backendForecast = await this.tryBackendForecast(formData);
    if (backendForecast) {
      return backendForecast;
    }

    return this.generateForecastFallback(formData);
  }

  private async tryBackendForecast(formData: any) {
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
    const endpoint = `${baseUrl}/api/forecast`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: formData.projectName,
          features: this.buildFeaturePayload(formData),
          metadata: {
            region: formData.region,
            location: formData.location,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = await response.json();
      return this.mapBackendForecastResponse(payload, formData);
    } catch (error) {
      console.error('Forecast API unavailable, using local heuristic', error);
      return null;
    }
  }

  private buildFeaturePayload(formData: any) {
    const budgetCrores = parseFloat(formData.budget) || 0;
    return {
      project_category_main: formData.projectCategory || formData.projectType || 'Transmission',
      project_type: formData.towerType || formData.substationType || formData.projectType || 'Transmission',
      project_budget_price_in_lake: budgetCrores * 100, // convert crores to lakhs
      state: formData.location || formData.region || 'Unknown',
      terrain: formData.terrain || 'Mixed',
      Distance_from_Storage_unit: parseFloat(formData.distanceFromStorage) || 50,
      transmission_line_length_km: parseFloat(formData.lineLength) || 100,
    };
  }

  private mapBackendForecastResponse(apiResponse: any, formData: any) {
    const materials = (apiResponse.outputs || []).map((output: any, index: number) => {
      const label = output?.label || `Output ${index + 1}`;
      const unitCost = DEFAULT_UNIT_COSTS[label] || 50000 * (index + 1);
      const quantity = Number(output?.value || 0);
      return {
        materialId: `ML-${index + 1}`,
        name: label,
        quantity: Number(quantity.toFixed(2)),
        unit: output?.unit || 'Units',
        unitCost,
        totalCost: unitCost * quantity,
      };
    });

    const subtotal = materials.reduce((sum: number, m: CostedMaterial) => sum + m.totalCost, 0);
    const taxes = subtotal * 0.18;
    const total = subtotal + taxes;
    const forecastId = apiResponse?.forecast_id || `FC${String(forecastsData.length + 1).padStart(3, '0')}`;
    const projectId = formData.projectId || `PRJ${String(projectsData.length + 1).padStart(3, '0')}`;

    this.recordForecastHistory(forecastId, projectId, materials);

    return {
      forecastId,
      projectName: formData.projectName,
      region: formData.region,
      location: formData.location,
      projectType: formData.projectType,
      towerType: formData.towerType,
      substationType: formData.substationType,
      budget: formData.budget,
      startDate: formData.startDate,
      endDate: formData.endDate,
      lineLength: formData.lineLength,
      materials,
      subtotal,
      taxes,
      total,
      confidence: apiResponse?.model_ready ? 94 : 80,
      generatedDate: apiResponse?.generated_at ? new Date(apiResponse.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
    };
  }

  private generateForecastFallback(formData: any) {
    const projectId = formData.projectId || `PRJ${String(projectsData.length + 1).padStart(3, '0')}`;
    const forecastId = `FC${String(forecastsData.length + 1).padStart(3, '0')}`;

    const materials: any[] = [];

    if (formData.projectType === 'Tower' || formData.projectType === 'Both') {
      const towerQty = Math.ceil((parseFloat(formData.lineLength) || 100) / 0.4);
      const conductorLength = (parseFloat(formData.lineLength) || 100) * 1000;

      materials.push(
        {
          materialId: 'MAT001',
          name: 'Steel Towers (Type A - 765kV)',
          quantity: Math.ceil(towerQty * 0.4),
          unit: 'Units',
          unitCost: 850000,
        },
        {
          materialId: 'MAT004',
          name: 'Conductors - ACSR 400mm',
          quantity: Math.ceil(conductorLength * 3),
          unit: 'Meters',
          unitCost: 450,
        },
        {
          materialId: 'MAT006',
          name: 'Insulators - Disc Type',
          quantity: Math.ceil(towerQty * 12),
          unit: 'Units',
          unitCost: 1200,
        },
        {
          materialId: 'MAT012',
          name: 'Foundation Bolts M36',
          quantity: Math.ceil(towerQty * 24),
          unit: 'Units',
          unitCost: 850,
        }
      );
    }

    if (formData.projectType === 'Substation' || formData.projectType === 'Both') {
      materials.push(
        {
          materialId: 'MAT008',
          name: 'Circuit Breakers 765kV',
          quantity: 8,
          unit: 'Units',
          unitCost: 1250000,
        },
        {
          materialId: 'MAT010',
          name: 'Transformers 765/400kV',
          quantity: 4,
          unit: 'Units',
          unitCost: 8500000,
        },
        {
          materialId: 'MAT006',
          name: 'Insulators - Disc Type',
          quantity: 500,
          unit: 'Units',
          unitCost: 1200,
        }
      );
    }

    const materialsWithCost = materials.map(m => ({
      ...m,
      totalCost: m.quantity * m.unitCost,
    }));

    const subtotal = materialsWithCost.reduce((sum: number, m: CostedMaterial) => sum + m.totalCost, 0);
    const taxes = subtotal * 0.18;
    const total = subtotal + taxes;

    this.recordForecastHistory(forecastId, projectId, materialsWithCost);

    return {
      forecastId,
      projectName: formData.projectName,
      region: formData.region,
      location: formData.location,
      projectType: formData.projectType,
      towerType: formData.towerType,
      substationType: formData.substationType,
      budget: formData.budget,
      startDate: formData.startDate,
      endDate: formData.endDate,
      lineLength: formData.lineLength,
      materials: materialsWithCost,
      subtotal,
      taxes,
      total,
      confidence: 94,
      generatedDate: new Date().toLocaleDateString(),
    };
  }

  private recordForecastHistory(forecastId: string, projectId: string, materials: any[]) {
    materials.forEach((material, index) => {
      forecastsData.push({
        id: `${forecastId}-${index + 1}`,
        projectId,
        materialId: material.materialId || material.name || `MAT-ML-${index + 1}`,
        month: new Date().toISOString().slice(0, 7),
        forecastedQty: material.quantity,
        actualQty: null,
        confidence: 94,
      });
    });
  }

  async createProject(projectData: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newProject = {
      id: `PRJ${String(projectsData.length + 1).padStart(3, '0')}`,
      ...projectData,
      status: 'Planning',
      completion: 0
    };
    projectsData.push(newProject);
    
    this.syncAllData();
    return newProject;
  }

  async updateProject(projectId: string, updates: any) {
    const index = projectsData.findIndex(p => p.id === projectId);
    if (index === -1) return null;
    
    projectsData[index] = { ...projectsData[index], ...updates };
    this.syncAllData();
    
    return projectsData[index];
  }

  async createProcurementOrder(poData: any) {
    const newPO = {
      id: `PO${String(procurementData.length + 1).padStart(3, '0')}`,
      ...poData,
      status: 'Pending',
      orderDate: new Date().toISOString().split('T')[0]
    };
    procurementData.push(newPO);
    
    this.syncAllData();
    return newPO;
  }
}

export const api = new API();
