-- CREATE DATABASE IF NOT EXISTS docs-control;

-- CREATE TABLE documents_metadata (
--     id SERIAL PRIMARY KEY,
--     document_name TEXT NOT NULL,
--     document_type TEXT NOT NULL,
--     party_responsible TEXT,  -- Can be NULL if not applicable
--     api_endpoint TEXT NOT NULL,
--     required_action TEXT NOT NULL,
--     biometric_required BOOLEAN NOT NULL DEFAULT FALSE,
--     geolocation_required BOOLEAN NOT NULL DEFAULT FALSE,
--     email_notification TEXT NOT NULL, -- Comma-separated list of recipients
--     for_india BOOLEAN NOT NULL DEFAULT FALSE,
--     for_us BOOLEAN NOT NULL DEFAULT FALSE
-- );

-- CREATE TABLE kyc_requirements (
--     id SERIAL PRIMARY KEY,
--     kyc_type TEXT NOT NULL,
--     required_in_india BOOLEAN NOT NULL DEFAULT FALSE,
--     required_in_us BOOLEAN NOT NULL DEFAULT FALSE
-- );


INSERT INTO document_rules 
(category, subcategory, party_responsible, api_endpoint, required_action, biometric_required) 
VALUES
-- Property Documents
('Property', 'Agency Agreement', 'Seller, Agent', '/transaction/initiate', 'Seller uploads and signs', TRUE),
('Property', 'Seller''s Disclosure Form', 'Seller', '/disclosure/update', 'Seller uploads and signs', TRUE),
('Property', 'MLS Listing Agreement', 'Agent', '/listing/create', 'Agent creates MLS listing', TRUE),
('Property', 'Inspection Report', 'Inspector', '/inspection/report/upload', 'Inspector uploads signed report', TRUE),
('Property', 'Title Report', 'Title Company', '/title/search', 'Title company uploads signed report', TRUE),
('Property', 'Purchase Agreement', 'Buyer, Seller', '/purchase/sign, /offer/submit', 'Buyer and seller sign after negotiations', TRUE),
('Property', 'Mortgage Loan Agreement', 'Buyer, Lender', '/mortgage/submit', 'Buyer applies for mortgage, lender reviews', TRUE),
('Property', 'Appraisal Report', 'Appraiser', '/appraisal/report/upload', 'Appraiser uploads the signed appraisal report', TRUE),
('Property', 'Final Contract', 'Buyer, Seller, Notary', '/closing/finalize, /notarize', 'Notary verifies and notarizes the final contract', TRUE),
('Property', 'Deed', 'Buyer, Seller, Notary', '/closing/finalize, /notarize', 'Buyer, seller, and notary finalize and sign the deed', TRUE),
('Property', 'Escrow Agreement', 'Escrow Agent', '/escrow/initiate, /escrow/funds/release', 'Escrow agent releases funds after signature', TRUE),
('Property', 'Lead-Based Paint Disclosure', 'Seller', '/disclosure/update', 'Seller signs and uploads', TRUE),

-- KYC Documents
('KYC', 'Aadhaar', NULL, NULL, NULL, FALSE),
('KYC', 'SSN', NULL, NULL, NULL, FALSE),
('KYC', 'Company ID', NULL, NULL, NULL, FALSE);

