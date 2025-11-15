# 🧩 Contract Flow Overall Concept

This describes the **complete lifecycle of a vehicle rental contract** in your **RCCMS (Rent-a-Car Contract Management System)** — from customer onboarding, vehicle handover, monitoring, to return and closure. It’s divided into **three key operational stages** plus administrative rules for exceptions.

---

## **STAGE 1 – Contract Creation & Vehicle Handover**

**Trigger:** Customer confirms vehicle, rent, and submits required documents.  
**Key Activities:**

- Collect or confirm customer details (create new if not existing).

- Select:
  
  - Contract type
  
  - Rental start date/time
  
  - Rental type (Daily, Weekly, Monthly)

- Enter inspection details:
  
  - Odometer (ODO)
  
  - Fuel level
  
  - Inspection remarks (mandatory if no photos)

- Record **advance payment details**.

- Contract is printable for submission to CID (police authority requirement).

- On saving, **contract becomes active** → vehicle handed over.

- Status changes to **Active**, visible on dashboard.

- **Edit button:** allows modifications (e.g., rental extension, fines, Salik tolls, etc.).

---

## **STAGE 2 – Vehicle Return & Contract Completion**

**Trigger:** Customer returns the vehicle.  
**Key Activities:**

- Enter return inspection details:
  
  - Date/time
  
  - ODO reading in
  
  - Auto-calculated extra kilometers and corresponding charges (editable for negotiation)

- Record collection of rental balance (advance held until full closure).

- Two possible flow paths:

### **Option 1 – Normal Return**

- Save → Status changes to **Complete**.

- Contract printout shows: *“Complete – Pending Final Settlement.”*

### **Option 2 – Accident Case**

- Attach **photo evidence** + **police report**.

- Collect **service charge**.

- Save → Status = **Complete (Not Closed)** with same pending message.

---

## **CLOSING – Admin / Manager Authority Only**

**Trigger:** All financial settlements finalized.

- Only **Admin or Manager** can **close** a contract.

- Once closed → cannot be edited.

- If customer owes money and hasn’t paid:
  
  - Add **remark** (e.g., “Pending legal settlement”).
  
  - Save contract but **do not close** (keep open for unlimited time until resolved).

---

## **Other Operational Notes**

- Most customers **collect vehicles from the office** (delivery/drop-off is rare).
  
  - Drop-off location field is optional; can default to “Office”.
  
  - Zero value allowed if no delivery fee.

- Timing and payment columns must be arranged so that “pending” values don’t remain visible once resolved.

- Testing workflow:
  
  - Initial test data can be reset (zeroed) after validation.
  
  - Future enhancement: Vehicle table includes **TC number** (for linking fines and Salik charges automatically).

---

### ✅ **Key Functional Insights**

Status progression: *Draft → Active → Complete → Closed*.

Only Admin can perform final closure.

In any stages edits should be possible other than Closed but with proper reasons for each edit. Should not accept reasons less than at least 10 words with each word more than three or four characters.

Closing should be possible by Admin even if there is balance amount to be paid.

Once closed the contract cannot be edited and only view will be possible that too for Admin

System allows open-ended contracts for disputed or unsettled cases.

Each stage has audit-friendly record keeping (remarks, attachments, timestamps).

CID-compliant printable contract is required.

---

### ❓**Questions / Clarifications I’d Ask**

1. Should the **advance payment** automatically adjust against the total payable on completion, or require manual adjustment?

2. For **photo evidence uploads**, do you want multiple photos (array) or single image per inspection event?

3. Should the **advance payment** automatically adjust against the total payable on completion, or require manual adjustment? - yes

4. Should the system auto-calculate **extra km charge rates** from a master tariff table?

5. For **accident cases**, do you need an additional “Insurance claim” tracking module?

6. Do we require **digital signature capture** (customer + staff) during handover/return?

7. Should the **open (unclosed)** contracts auto-remind admins after a certain time (e.g., 30 days)?

8. Will the **TC number** link to an API (e.g., RTA fine retrieval) or remain manual input?

9. For **photo evidence uploads**, do you want multiple photos (array) or single image per inspection event? Actually front, back and both sides plus top and dashboard or any other internal or external damages (seat, scratches etc.) for pre-delivery and post-return else if photos not uploaded then remark regarding the condition is mandatory. Also if needed provision to add more photos.

10. Is **CID print format** standardized (template required) or variable per branch? - All informations entered along with legal and other terms need to be there.

11. Should the system auto-calculate **extra km charge rates** from a master tariff table? - yes, a master per km charge and fuel capacity of tank with auto calculation of % and then charge automatically upon fuel guage % entry post return using pre delivery fuel guage %.

12. For **accident cases**, do you need an additional “Insurance claim” tracking module? - yes

13. Do we require **digital signature capture** (customer + staff) during handover/return? - Digital signature yes when we build app for staff and customer, but provision needs to be there. Also provision or space for manul signature in PDF form also when printed.

14. Should the **open (unclosed)** contracts auto-remind admins after a certain time (e.g., 30 days)? - yes please also provision to attach SOA and send as email like in the error reporting. A report in the reporting section in this regards and a dashboard card would be nice.

15. Will the **TC number** link to an API (e.g., RTA fine retrieval) or remain manual input? - yes, for vehicle traffic plate no, Place of issue, Traffic Code No, Owner name, Owner nationality, expiry date, insurance expiry date, Policy number, Mortgaged by, Model, origin, Vehicle type, Gross vehicle weight, Gross vehicle weight type (kilo etc.), Engine no, Chasis no, licensing authority are needed.

16. For driving license License no, name, Nationality, Date of birth, Dat of issue, Date of Expiry, Place of issue, licensing authority, Traffic code no, Permitted vehicles, Automatic or manual, vehicle type, wearing glass or not are neededIs **CID print format** standardized (template required) or variable per branch?
