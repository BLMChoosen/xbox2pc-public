export interface PublicOverviewData {
  schema_version: string;
  project: string;
  snapshot: string;
  public_snapshot_id: string;
  generated_at: string;
  discovery: {
    physical_binaries: number;
    logical_libraries: number;
    unique_exports: number;
    unique_imports: number;
    unique_shader_instructions: number;
    decoded_shader_occurrences: number;
    total_workspace_files?: number;
    total_components?: number;
  };
  coverage: {
    global: null;
    analysis: { completed: number; known: number; percentage: number };
    implementation: { completed: number; known: number; percentage: number };
    testing?: { completed: number; known: number; percentage: number };
    validation?: { completed: number; known: number; percentage: number };
    game_requirement?: { completed: number; known: number | null; percentage: number | null };
  };
  project_info: {
    phase: string;
    target_platform: string;
    target_architecture: string;
    limitations_summary: string[];
    audit_verdict?: string;
    audit_discrepancies_count?: number;
  };
}

export interface PublicCoverageMetric {
  name: string;
  numerator: number;
  denominator: number | null;
  percentage: number | null;
  display_string: string;
  reference_universe: string;
  is_global_unknown: boolean;
  description: string;
}

export interface PublicCoverageData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  public_snapshot_id: string;
  metrics: Record<string, PublicCoverageMetric>;
  anti_inflation_rules: string[];
}

export interface PublicLibraryItem {
  name: string;
  subsystem: string;
  category: string;
  exports_count: number;
  imports_count: number;
  is_physical: boolean;
  status: string;
  description: string;
}

export interface PublicSubsystemSummary {
  name: string;
  library_count: number;
  export_count: number;
  libraries: string[];
}

export interface PublicLibraryStatsData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  public_snapshot_id: string;
  summary: {
    unique_physical_files: number;
    unique_logical_identities: number;
    known_platform_library_identities: number;
    unresolved_library_identities: number;
    total_records: number;
  };
  subsystems: PublicSubsystemSummary[];
  libraries: PublicLibraryItem[];
}

export interface PublicShaderMnemonic {
  mnemonic: string;
  occurrences: number;
  format: string;
  description: string;
}

export interface PublicShaderFamily {
  family: string;
  occurrences: number;
  unique_mnemonics: number;
  description: string;
  mnemonics: PublicShaderMnemonic[];
}

export interface PublicShaderStatsData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  public_snapshot_id: string;
  architecture: string;
  summary: {
    unique_instructions: number;
    unique_mnemonic_variants?: number;
    distinct_family_opcode_pairs?: number;
    distinct_semantic_operations?: number;
    unique_instruction_encodings: number;
    supported_instruction_variants: number;
    instruction_formats: number;
    operand_combinations: number;
    total_decoded_occurrences: number;
  };
  families: PublicShaderFamily[];
  formats: { format: string; count: number }[];
}

export interface PublicDependencyTarget {
  target: string;
  subsystem: string;
  dependent_count: number;
  description: string;
}

export interface PublicDependencyRelation {
  source: string;
  target: string;
  type: string;
  is_resolved: boolean;
  notes?: string | null;
}

export interface PublicDependencyStatsData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  public_snapshot_id: string;
  summary: {
    total_edges: number;
    resolved_edges: number;
    unresolved_edges: number;
    circular_cycles: number;
  };
  unresolved_platform_targets: PublicDependencyTarget[];
  relationships: PublicDependencyRelation[];
}

export interface PublicSnapshotItem {
  snapshot_id: string;
  version: string;
  timestamp: string;
  total_components: number;
  unique_exports: number;
  unique_imports: number;
  unique_shader_instructions: number;
  decoded_shader_occurrences: number;
  analysis_coverage: number;
  implementation_coverage: number;
  status: string;
  description: string;
}

export interface PublicSnapshotIndexData {
  schema_version: string;
  generated_at: string;
  latest_snapshot: string;
  snapshots: PublicSnapshotItem[];
}

export interface PublicCatalogItem {
  id: string;
  name: string;
  type: string;
  category: string;
  subsystem: string;
  status: string;
  description: string;
}

export interface PublicCatalogData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  items: PublicCatalogItem[];
}

export interface PublicImplementationRecord {
  component_id: string;
  name: string;
  subsystem: string;
  category: string;
  implementation_status: string;
  testing_status: string;
  validation_status: string;
  source_file_ref: string;
  git_commit_ref?: string | null;
  implemented_at: string;
  developer_notes?: string | null;
  test_identifiers: string[];
  test_summary: string;
  validation_evidence?: string | null;
  is_stub: boolean;
  flagged_for_review: boolean;
  review_reason?: string | null;
}

export interface PublicImplementationSummary {
  total_discovered: number;
  game_required: number;
  implemented: number;
  stubs: number;
  partial: number;
  tested: number;
  validated: number;
  implemented_not_validated: number;
  flagged_for_review: number;
}

export interface PublicImplementationStatsData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  public_snapshot_id: string;
  summary: PublicImplementationSummary;
  implementations: PublicImplementationRecord[];
}

export interface PublicDiscrepancyItem {
  id: string;
  category: string;
  title: string;
  status: string;
  impact: string;
  description: string;
  evidence_reference: string;
}

export interface PublicAuditStatusData {
  schema_version: string;
  generated_at: string;
  snapshot: string;
  public_snapshot_id: string;
  audit_date: string;
  verdict: string;
  discrepancies_count: number;
  discrepancies: PublicDiscrepancyItem[];
  verified_public_snapshot_id: string;
  auditor: string;
  evidence_references: string[];
}
