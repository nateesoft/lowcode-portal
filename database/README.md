# Flow Version Control Database Schema

## Overview
This database schema implements a comprehensive version control system for workflow flows, supporting semantic versioning, audit trails, and version management features.

## Tables

### 1. `flow_versions`
Main table storing flow version data with semantic versioning support.

**Columns:**
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `flow_id` (INTEGER NOT NULL) - Reference to the flow being versioned
- `version` (VARCHAR(20)) - Semantic version string (e.g., "v1.2.3")
- `version_number` (INTEGER) - Incremental number for ordering
- `name` (VARCHAR(255)) - User-friendly name for the version
- `description` (TEXT) - Optional description of changes
- `nodes` (JSON) - Flow nodes data stored as JSON
- `edges` (JSON) - Flow edges data stored as JSON
- `metadata` (JSON) - Additional metadata (node count, edge count, etc.)
- `created_by` (INTEGER) - User ID who created this version
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `is_active` (BOOLEAN) - Whether this version is currently active
- `change_log` (TEXT) - Detailed changelog for this version

**Indexes:**
- `idx_flow_versions_flow_id` - For flow-based queries
- `idx_flow_versions_version_number` - For version ordering
- `idx_flow_versions_active` - For active version queries
- `idx_flow_versions_created_at` - For chronological queries

### 2. `flow_version_history`
Audit trail table tracking all actions performed on versions.

**Columns:**
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `version_id` (INTEGER NOT NULL) - Reference to flow_versions
- `action_type` (ENUM) - Type of action: 'created', 'activated', 'deactivated', 'restored', 'deleted'
- `performed_by` (INTEGER) - User ID who performed the action
- `performed_at` (TIMESTAMP) - When the action was performed
- `old_values` (JSON) - Previous state before the action
- `new_values` (JSON) - New state after the action
- `notes` (TEXT) - Optional notes about the action

### 3. `flow_version_tags`
Optional tagging system for categorizing versions.

**Columns:**
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `version_id` (INTEGER NOT NULL) - Reference to flow_versions
- `tag_name` (VARCHAR(50)) - Tag name (e.g., "stable", "beta", "hotfix")
- `created_at` (TIMESTAMP) - Creation timestamp

## Views

### `active_flow_versions`
Returns all currently active versions with user details.

### `flow_version_history_details`
Returns version history with full user and version details.

## Stored Procedures

### `CreateFlowVersion`
Creates a new version with automatic semantic versioning.

**Parameters:**
- `p_flow_id` - Flow ID to version
- `p_name` - Version name
- `p_description` - Version description
- `p_nodes` - Flow nodes as JSON
- `p_edges` - Flow edges as JSON
- `p_metadata` - Additional metadata as JSON
- `p_created_by` - User ID creating the version
- `p_change_log` - Change log text
- `p_version_type` - 'major', 'minor', or 'patch'

### `RestoreFlowVersion`
Restores a specific version as the active version.

**Parameters:**
- `p_version_id` - Version ID to restore
- `p_performed_by` - User ID performing the restoration
- `p_notes` - Optional notes about the restoration

## Semantic Versioning

The system follows semantic versioning (SemVer) with the format `vMAJOR.MINOR.PATCH`:

- **MAJOR**: Breaking changes or significant architecture updates
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and small improvements

## Usage Examples

### Creating a New Version
```sql
CALL CreateFlowVersion(
    1,                              -- flow_id
    'Feature Update',               -- name
    'Added new node types',         -- description
    '[{"id":"1","type":"start"}]',  -- nodes JSON
    '[{"id":"e1","source":"1"}]',   -- edges JSON
    '{"nodeCount":1,"edgeCount":1}', -- metadata JSON
    1,                              -- created_by
    'Added START and END nodes',    -- change_log
    'minor'                         -- version_type
);
```

### Restoring a Version
```sql
CALL RestoreFlowVersion(
    5,                              -- version_id
    1,                              -- performed_by
    'Rollback due to issues'        -- notes
);
```

### Getting All Versions for a Flow
```sql
SELECT * FROM flow_versions 
WHERE flow_id = 1 
ORDER BY version_number DESC;
```

### Getting Active Version
```sql
SELECT * FROM active_flow_versions 
WHERE flow_id = 1;
```

## Integration with Application

The database schema is designed to work with the TypeScript interfaces defined in the application:

### TypeScript Interface Mapping

```typescript
interface FlowVersion {
  id?: number;                    // flow_versions.id
  flowId: number;                 // flow_versions.flow_id
  version: string;                // flow_versions.version
  versionNumber: number;          // flow_versions.version_number
  name: string;                   // flow_versions.name
  description?: string;           // flow_versions.description
  nodes: any[];                   // flow_versions.nodes (parsed from JSON)
  edges: any[];                   // flow_versions.edges (parsed from JSON)
  metadata?: any;                 // flow_versions.metadata (parsed from JSON)
  createdBy: number;              // flow_versions.created_by
  createdAt?: string;             // flow_versions.created_at
  isActive?: boolean;             // flow_versions.is_active
  changeLog?: string;             // flow_versions.change_log
}
```

## Migration Instructions

1. **Create the database tables:**
   ```sql
   source database/flow_versions_schema.sql
   ```

2. **Update your API endpoints** to use the database instead of mock data

3. **Test the stored procedures** with sample data

4. **Update the application** to handle version restoration properly

## Performance Considerations

- **Indexes**: All major query patterns are indexed for performance
- **JSON Storage**: Node and edge data is stored as JSON for flexibility
- **Partitioning**: Consider partitioning by flow_id for large datasets
- **Archiving**: Implement archiving strategy for old versions

## Security Considerations

- **User Authentication**: Ensure created_by and performed_by are validated
- **Data Validation**: Validate JSON structure before storage
- **Access Control**: Implement proper access controls for version operations
- **Audit Trail**: All actions are logged in flow_version_history

## Backup and Recovery

- **Regular Backups**: Schedule regular backups of version data
- **Point-in-Time Recovery**: Use transaction logs for precise recovery
- **Version Export**: Implement version export functionality for additional backup