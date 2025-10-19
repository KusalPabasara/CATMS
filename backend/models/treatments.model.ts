// Shim so imports to "../models/treatments.model" work everywhere.
// Re-export the catalogue model defined in "./treatment.model".
import Treatments from './treatment.model';
export default Treatments;
export * from './treatment.model';