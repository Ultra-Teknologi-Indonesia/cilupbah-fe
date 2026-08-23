export interface PermissionActionCell {
  action: string;

  label: string;

  permission: string;
}

export interface PermissionExtra {
  permission: string;
  label: string;
}

export interface PermissionResource {
  key: string;
  label: string;
  actions: PermissionActionCell[];
  extras: PermissionExtra[];
}

export interface PermissionGroup {
  key: string;
  label: string;
  resources: PermissionResource[];
}
