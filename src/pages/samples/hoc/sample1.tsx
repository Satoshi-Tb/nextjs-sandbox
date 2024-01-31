import { HocSample as sample1 } from "@/components/hoc/HocSample";
import { withLoading } from "@/components/hoc/withLoading";
import { withLogger } from "@/components/hoc/withLogger";

// HOCは外から適用される
const EnhancedComponent = withLogger(withLoading(sample1));

export default EnhancedComponent;
