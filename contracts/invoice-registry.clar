;; SatsGate Invoice Registry
;; A simple smart contract to register invoice metadata on Stacks blockchain

;; Define the invoice data structure
(define-map invoices
  { invoice-id: (string-ascii 64) }
  {
    merchant: principal,
    amount: uint,
    memo: (string-utf8 256),
    btc-address: (string-ascii 64),
    created-at: uint,
    status: (string-ascii 16)
  }
)

;; Define error constants
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-UNAUTHORIZED (err u401))
(define-constant ERR-ALREADY-EXISTS (err u409))

;; Register a new invoice
(define-public (register-invoice 
  (invoice-id (string-ascii 64))
  (amount uint)
  (memo (string-utf8 256))
  (btc-address (string-ascii 64)))
  (let ((existing-invoice (map-get? invoices { invoice-id: invoice-id })))
    (if (is-some existing-invoice)
      ERR-ALREADY-EXISTS
      (begin
        (map-set invoices
          { invoice-id: invoice-id }
          {
            merchant: tx-sender,
            amount: amount,
            memo: memo,
            btc-address: btc-address,
            created-at: block-height,
            status: "pending"
          }
        )
        (ok invoice-id)
      )
    )
  )
)

;; Update invoice status (only by merchant)
(define-public (update-invoice-status 
  (invoice-id (string-ascii 64))
  (new-status (string-ascii 16)))
  (let ((invoice-data (map-get? invoices { invoice-id: invoice-id })))
    (match invoice-data
      invoice
      (if (is-eq (get merchant invoice) tx-sender)
        (begin
          (map-set invoices
            { invoice-id: invoice-id }
            (merge invoice { status: new-status })
          )
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-NOT-FOUND
    )
  )
)

;; Get invoice details
(define-read-only (get-invoice (invoice-id (string-ascii 64)))
  (map-get? invoices { invoice-id: invoice-id })
)

;; Get invoice status
(define-read-only (get-invoice-status (invoice-id (string-ascii 64)))
  (match (map-get? invoices { invoice-id: invoice-id })
    invoice (ok (get status invoice))
    ERR-NOT-FOUND
  )
)

;; Check if invoice exists
(define-read-only (invoice-exists (invoice-id (string-ascii 64)))
  (is-some (map-get? invoices { invoice-id: invoice-id }))
)