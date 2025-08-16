-- Flow Version Control Database Schema
-- This schema supports versioning of workflow flows with semantic versioning

-- Flow Versions Table
CREATE TABLE flow_versions (
    id SERIAL PRIMARY KEY,
    flow_id INTEGER NOT NULL,
    version VARCHAR(20) NOT NULL, -- Semantic version format (v1.2.3)
    version_number INTEGER NOT NULL, -- Incremental number for ordering
    name VARCHAR(255) NOT NULL, -- User-friendly name for this version
    description TEXT, -- Optional description of changes
    nodes JSON NOT NULL, -- Flow nodes data (stored as JSON)
    edges JSON NOT NULL, -- Flow edges data (stored as JSON)
    metadata JSON, -- Additional metadata (node count, edge count, etc.)
    created_by INTEGER NOT NULL, -- User ID who created this version
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE, -- Only one version per flow should be active
    change_log TEXT, -- Detailed changelog for this version
    
    -- Indexes for performance
    INDEX idx_flow_versions_flow_id (flow_id),
    INDEX idx_flow_versions_version_number (flow_id, version_number),
    INDEX idx_flow_versions_active (flow_id, is_active),
    INDEX idx_flow_versions_created_at (created_at),
    
    -- Constraints
    UNIQUE KEY unique_active_version (flow_id, is_active) -- Only one active version per flow
        -- Note: This constraint will need special handling in application logic
        -- as MySQL doesn't support partial unique indexes
);

-- Flow Version History (for audit trail)
CREATE TABLE flow_version_history (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL,
    action_type ENUM('created', 'activated', 'deactivated', 'restored', 'deleted') NOT NULL,
    performed_by INTEGER NOT NULL, -- User ID who performed the action
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSON, -- Previous state (for rollback)
    new_values JSON, -- New state
    notes TEXT, -- Optional notes about the action
    
    -- Foreign key constraint
    FOREIGN KEY (version_id) REFERENCES flow_versions(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_version_history_version_id (version_id),
    INDEX idx_version_history_performed_at (performed_at)
);

-- Flow Version Tags (for categorizing versions)
CREATE TABLE flow_version_tags (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (version_id) REFERENCES flow_versions(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate tags per version
    UNIQUE KEY unique_version_tag (version_id, tag_name),
    
    -- Indexes
    INDEX idx_version_tags_tag_name (tag_name)
);

-- Trigger to update updated_at timestamp
DELIMITER //
CREATE TRIGGER flow_versions_updated_at
    BEFORE UPDATE ON flow_versions
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Example data for testing
INSERT INTO flow_versions (
    flow_id, version, version_number, name, description, 
    nodes, edges, metadata, created_by, is_active, change_log
) VALUES (
    1, 'v1.0.0', 1, 'Initial Version', 'First version of the workflow',
    '[]', '[]', '{"nodeCount": 0, "edgeCount": 0, "createdFrom": "workflow-editor"}',
    1, TRUE, 'Initial workflow creation'
);

-- Views for common queries
-- Active versions view
CREATE VIEW active_flow_versions AS
SELECT 
    fv.*,
    u.email as created_by_email,
    u.firstName as created_by_first_name,
    u.lastName as created_by_last_name
FROM flow_versions fv
LEFT JOIN users u ON fv.created_by = u.id
WHERE fv.is_active = TRUE;

-- Version history with user details
CREATE VIEW flow_version_history_details AS
SELECT 
    fvh.*,
    fv.flow_id,
    fv.version,
    fv.name as version_name,
    u.email as performed_by_email,
    u.firstName as performed_by_first_name,
    u.lastName as performed_by_last_name
FROM flow_version_history fvh
JOIN flow_versions fv ON fvh.version_id = fv.id
LEFT JOIN users u ON fvh.performed_by = u.id
ORDER BY fvh.performed_at DESC;

-- Stored procedure to create a new version
DELIMITER //
CREATE PROCEDURE CreateFlowVersion(
    IN p_flow_id INTEGER,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_nodes JSON,
    IN p_edges JSON,
    IN p_metadata JSON,
    IN p_created_by INTEGER,
    IN p_change_log TEXT,
    IN p_version_type ENUM('major', 'minor', 'patch')
)
BEGIN
    DECLARE v_current_version VARCHAR(20);
    DECLARE v_new_version VARCHAR(20);
    DECLARE v_new_version_number INTEGER;
    DECLARE v_major INTEGER DEFAULT 1;
    DECLARE v_minor INTEGER DEFAULT 0;
    DECLARE v_patch INTEGER DEFAULT 0;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Get current active version
    SELECT version, version_number 
    INTO v_current_version, v_new_version_number
    FROM flow_versions 
    WHERE flow_id = p_flow_id AND is_active = TRUE
    ORDER BY version_number DESC 
    LIMIT 1;
    
    -- Calculate new version number
    IF v_current_version IS NOT NULL THEN
        -- Parse current version
        SET v_major = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(v_current_version, 'v', ''), '.', 1), '.', -1) AS UNSIGNED);
        SET v_minor = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(v_current_version, 'v', ''), '.', 2), '.', -1) AS UNSIGNED);
        SET v_patch = CAST(SUBSTRING_INDEX(REPLACE(v_current_version, 'v', ''), '.', -1) AS UNSIGNED);
        
        -- Increment based on version type
        CASE p_version_type
            WHEN 'major' THEN
                SET v_major = v_major + 1;
                SET v_minor = 0;
                SET v_patch = 0;
            WHEN 'minor' THEN
                SET v_minor = v_minor + 1;
                SET v_patch = 0;
            WHEN 'patch' THEN
                SET v_patch = v_patch + 1;
        END CASE;
        
        SET v_new_version_number = v_new_version_number + 1;
    END IF;
    
    -- Create new version string
    SET v_new_version = CONCAT('v', v_major, '.', v_minor, '.', v_patch);
    
    -- Deactivate current active version
    UPDATE flow_versions 
    SET is_active = FALSE 
    WHERE flow_id = p_flow_id AND is_active = TRUE;
    
    -- Insert new version
    INSERT INTO flow_versions (
        flow_id, version, version_number, name, description,
        nodes, edges, metadata, created_by, is_active, change_log
    ) VALUES (
        p_flow_id, v_new_version, v_new_version_number, p_name, p_description,
        p_nodes, p_edges, p_metadata, p_created_by, TRUE, p_change_log
    );
    
    -- Record history
    INSERT INTO flow_version_history (
        version_id, action_type, performed_by, notes
    ) VALUES (
        LAST_INSERT_ID(), 'created', p_created_by, p_change_log
    );
    
    COMMIT;
    
    -- Return the new version
    SELECT * FROM flow_versions WHERE id = LAST_INSERT_ID();
END//
DELIMITER ;

-- Stored procedure to restore a version
DELIMITER //
CREATE PROCEDURE RestoreFlowVersion(
    IN p_version_id INTEGER,
    IN p_performed_by INTEGER,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_flow_id INTEGER;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Get flow_id for this version
    SELECT flow_id INTO v_flow_id
    FROM flow_versions 
    WHERE id = p_version_id;
    
    -- Deactivate all versions for this flow
    UPDATE flow_versions 
    SET is_active = FALSE 
    WHERE flow_id = v_flow_id;
    
    -- Activate the selected version
    UPDATE flow_versions 
    SET is_active = TRUE 
    WHERE id = p_version_id;
    
    -- Record history
    INSERT INTO flow_version_history (
        version_id, action_type, performed_by, notes
    ) VALUES (
        p_version_id, 'restored', p_performed_by, p_notes
    );
    
    COMMIT;
    
    -- Return the restored version
    SELECT * FROM flow_versions WHERE id = p_version_id;
END//
DELIMITER ;