;; SatsGate Escrow Contract
;; Non-custodial Bitcoin payment escrow on Stacks

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-escrow-not-found (err u101))
(define-constant err-invalid-status (err u102))
(define-constant err-insufficient-funds (err u103))
(define-constant err-deadline-passed (err u104))
(define-constant err-already-funded (err u105))

;; Data Variables
(define-data-var escrow-nonce uint u0)

;; Escrow Status
(define-constant status-created u0)
(define-constant status-funded u1)
(define-constant status-completed u2)
(define-constant status-released u3)
(define-constant status-cancelled u4)

;; Data Maps
(define-map escrows
  { escrow-id: uint }
  {
    seller: principal,
    buyer: (optional principal),
    amount: uint,
    status: uint,
    deadline: uint,
    description: (string-utf8 256),
    created-at: uint,
    funded-at: (optional uint),
    completed-at: (optional uint)
  }
)

;; Read-only functions

(define-read-only (get-escrow (escrow-id uint))
  (map-get? escrows { escrow-id: escrow-id })
)

(define-read-only (get-escrow-nonce)
  (var-get escrow-nonce)
)

;; Public functions

;; Create new escrow
(define-public (create-escrow (amount uint) (deadline uint) (description (string-utf8 256)) (buyer (optional principal)))
  (let
    (
      (escrow-id (+ (var-get escrow-nonce) u1))
    )
    (asserts! (> amount u0) err-insufficient-funds)
    (asserts! (> deadline block-height) err-deadline-passed)
    
    (map-set escrows
      { escrow-id: escrow-id }
      {
        seller: tx-sender,
        buyer: buyer,
        amount: amount,
        status: status-created,
        deadline: deadline,
        description: description,
        created-at: block-height,
        funded-at: none,
        completed-at: none
      }
    )
    
    (var-set escrow-nonce escrow-id)
    (ok escrow-id)
  )
)

;; Buyer deposits funds into escrow
(define-public (deposit (escrow-id uint))
  (let
    (
      (escrow (unwrap! (get-escrow escrow-id) err-escrow-not-found))
      (amount (get amount escrow))
    )
    ;; Validate escrow status
    (asserts! (is-eq (get status escrow) status-created) err-invalid-status)
    
    ;; Check if buyer is specified and matches
    (match (get buyer escrow)
      specified-buyer (asserts! (is-eq tx-sender specified-buyer) err-not-authorized)
      true
    )
    
    ;; Check deadline
    (asserts! (< block-height (get deadline escrow)) err-deadline-passed)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update escrow status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow {
        buyer: (some tx-sender),
        status: status-funded,
        funded-at: (some block-height)
      })
    )
    
    (ok true)
  )
)

;; Seller marks work as complete
(define-public (mark-complete (escrow-id uint))
  (let
    (
      (escrow (unwrap! (get-escrow escrow-id) err-escrow-not-found))
    )
    ;; Only seller can mark complete
    (asserts! (is-eq tx-sender (get seller escrow)) err-not-authorized)
    
    ;; Must be funded
    (asserts! (is-eq (get status escrow) status-funded) err-invalid-status)
    
    ;; Update status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow {
        status: status-completed,
        completed-at: (some block-height)
      })
    )
    
    (ok true)
  )
)

;; Buyer releases funds to seller
(define-public (release-funds (escrow-id uint))
  (let
    (
      (escrow (unwrap! (get-escrow escrow-id) err-escrow-not-found))
      (amount (get amount escrow))
      (seller (get seller escrow))
      (buyer-principal (unwrap! (get buyer escrow) err-not-authorized))
    )
    ;; Only buyer can release funds
    (asserts! (is-eq tx-sender buyer-principal) err-not-authorized)
    
    ;; Must be completed
    (asserts! (is-eq (get status escrow) status-completed) err-invalid-status)
    
    ;; Transfer funds from contract to seller
    (try! (as-contract (stx-transfer? amount tx-sender seller)))
    
    ;; Update status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow {
        status: status-released
      })
    )
    
    (ok true)
  )
)

;; Cancel escrow (only if not funded or deadline passed)
(define-public (cancel-escrow (escrow-id uint))
  (let
    (
      (escrow (unwrap! (get-escrow escrow-id) err-escrow-not-found))
      (amount (get amount escrow))
    )
    ;; Only seller can cancel
    (asserts! (is-eq tx-sender (get seller escrow)) err-not-authorized)
    
    (if (is-eq (get status escrow) status-created)
      ;; Not funded yet - just cancel
      (begin
        (map-set escrows
          { escrow-id: escrow-id }
          (merge escrow { status: status-cancelled })
        )
        (ok true)
      )
      ;; If funded and deadline passed, refund buyer
      (if (and 
            (is-eq (get status escrow) status-funded)
            (>= block-height (get deadline escrow)))
        (let
          (
            (buyer-principal (unwrap! (get buyer escrow) err-not-authorized))
          )
          ;; Refund buyer
          (try! (as-contract (stx-transfer? amount tx-sender buyer-principal)))
          
          ;; Update status
          (map-set escrows
            { escrow-id: escrow-id }
            (merge escrow { status: status-cancelled })
          )
          (ok true)
        )
        err-invalid-status
      )
    )
  )
)
