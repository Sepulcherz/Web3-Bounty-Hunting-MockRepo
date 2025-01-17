use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ProposalStatus {
    Pending,
    Approved,
    Rejected,
    Disputed
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Proposal {
    pub id: u32,
    pub hunter_address: String,
    pub github_pr_url: String,
    pub description: String,
    pub status: ProposalStatus,
    pub approvals: u32,
    pub validators: Vec<String>,
    pub timestamp: u64,
}

#[wasm_bindgen]
pub struct BountyInterface {
    contract_address: String,
    proposals: Vec<Proposal>,
    validators: HashMap<String, bool>,
    next_proposal_id: u32,
}

#[wasm_bindgen]
impl BountyInterface {
    #[wasm_bindgen(constructor)]
    pub fn new(address: String) -> Self {
        console::log_1(&"Initializing BountyInterface".into());
        
        let mut validators = HashMap::new();
        validators.insert(address.clone(), true);

        Self {
            contract_address: address,
            proposals: Vec::new(),
            validators,
            next_proposal_id: 1,
        }
    }

    #[wasm_bindgen]
    pub fn connect(&self) -> Result<(), JsValue> {
        console::log_1(&"Connected to blockchain".into());
        Ok(())
    }

    #[wasm_bindgen]
    pub fn submit_proposal(&mut self, github_pr_url: String, description: String, hunter_address: String) -> Result<String, JsValue> {
        let proposal = Proposal {
            id: self.next_proposal_id,
            hunter_address: hunter_address.clone(),
            github_pr_url,
            description,
            status: ProposalStatus::Pending,
            approvals: 0,
            validators: Vec::new(),
            timestamp: js_sys::Date::now() as u64,
        };

        self.proposals.push(proposal);
        self.next_proposal_id += 1;

        Ok("Proposal submitted successfully".to_string())
    }

    #[wasm_bindgen]
    pub fn get_time_left(&self) -> Result<u64, JsValue> {
        Ok(86400)
    }

    #[wasm_bindgen]
    pub fn get_proposals(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.proposals)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    #[wasm_bindgen]
    pub fn approve_proposal(&mut self, proposal_id: u32, validator_address: String) -> Result<String, JsValue> {
        if !self.validators.contains_key(&validator_address) {
            return Err(JsValue::from_str("Not an authorized validator"));
        }

        if let Some(proposal) = self.proposals.iter_mut().find(|p| p.id == proposal_id) {
            if proposal.validators.contains(&validator_address) {
                return Err(JsValue::from_str("Already approved"));
            }

            proposal.validators.push(validator_address);
            proposal.approvals += 1;

            if proposal.approvals >= 2 {
                proposal.status = ProposalStatus::Approved;
            }

            Ok("Proposal approved".to_string())
        } else {
            Err(JsValue::from_str("Proposal not found"))
        }
    }

    #[wasm_bindgen]
    pub fn is_validator(&self, address: String) -> bool {
        self.validators.contains_key(&address)
    }
}

#[wasm_bindgen(start)]
pub fn start() {
    console::log_1(&"WASM Module initialized".into());
}